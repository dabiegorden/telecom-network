import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Post from "../models/Post.js";
import Connection from "../models/Connection.js";
import Conversation from "../models/Conversation.js";

// Helper: bucket documents by month label for the last N months
function bucketByMonth(docs, dateField, months = 6) {
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    result.push({ month: label, count: 0 });
  }

  for (const doc of docs) {
    const date = new Date(doc[dateField]);
    for (const bucket of result) {
      const [mon, yr] = bucket.month.split(" ");
      const bucketDate = new Date(`${mon} 20${yr}`);
      if (
        date.getFullYear() === bucketDate.getFullYear() &&
        date.getMonth() === bucketDate.getMonth()
      ) {
        bucket.count++;
        break;
      }
    }
  }

  return result;
}

// ─── GET /analytics/platform  (admin only) ───────────────────────────────────
export const getPlatformAnalytics = async (req, res) => {
  try {
    const [users, professionals, recruiters, jobs, applications, posts, connections] =
      await Promise.all([
        User.find({}, "role createdAt").lean(),
        User.find({ role: "professional" }, "createdAt").lean(),
        User.find({ role: "recruiter" }, "createdAt").lean(),
        Job.find({}, "status createdAt postedBy").lean(),
        JobApplication.find({}, "status createdAt job").lean(),
        Post.find({}, "category createdAt likeCount commentCount viewCount").lean(),
        Connection.find({ status: "accepted" }, "createdAt").lean(),
      ]);

    // Monthly trends
    const userGrowth = bucketByMonth(users, "createdAt", 6);
    const jobGrowth = bucketByMonth(jobs, "createdAt", 6);
    const applicationGrowth = bucketByMonth(applications, "createdAt", 6);
    const postGrowth = bucketByMonth(posts, "createdAt", 6);

    // Combined activity chart
    const activityByMonth = userGrowth.map((u, i) => ({
      month: u.month,
      users: u.count,
      jobs: jobGrowth[i].count,
      applications: applicationGrowth[i].count,
      posts: postGrowth[i].count,
    }));

    // Application status distribution
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    // Post categories
    const catCounts = posts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    const postsByCategory = Object.entries(catCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // User role distribution
    const roleDist = [
      { role: "Professionals", count: professionals.length },
      { role: "Recruiters", count: recruiters.length },
    ];

    res.json({
      success: true,
      data: {
        totals: {
          users: users.length,
          professionals: professionals.length,
          recruiters: recruiters.length,
          jobs: jobs.length,
          applications: applications.length,
          posts: posts.length,
          connections: connections.length,
        },
        activityByMonth,
        applicationsByStatus,
        postsByCategory,
        userGrowth,
        jobGrowth,
        roleDist,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

// ─── GET /analytics/recruiter  (recruiter only) ──────────────────────────────
export const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const myJobs = await Job.find({ postedBy: recruiterId }, "_id title status createdAt").lean();
    const jobIds = myJobs.map((j) => j._id);

    const applications = await JobApplication.find(
      { job: { $in: jobIds } },
      "status job createdAt"
    ).lean();

    // Applications per job
    const appPerJob = myJobs.map((job) => ({
      title: job.title.length > 20 ? job.title.slice(0, 20) + "…" : job.title,
      fullTitle: job.title,
      applications: applications.filter((a) => a.job.toString() === job._id.toString()).length,
    }));

    // Pipeline status distribution
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    const pipeline = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    // Monthly applications trend (last 6 months)
    const applicationGrowth = bucketByMonth(applications, "createdAt", 6);

    // Job status breakdown
    const jobStatusCounts = myJobs.reduce((acc, j) => {
      const s = j.status || "active";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const jobsByStatus = Object.entries(jobStatusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    res.json({
      success: true,
      data: {
        totals: {
          jobs: myJobs.length,
          applications: applications.length,
          pending: applications.filter((a) => a.status === "pending").length,
          shortlisted: applications.filter((a) => a.status === "shortlisted").length,
          hired: applications.filter((a) => a.status === "hired").length,
        },
        appPerJob,
        pipeline,
        applicationGrowth,
        jobsByStatus,
      },
    });
  } catch (err) {
    console.error("Recruiter analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch recruiter analytics" });
  }
};

// ─── GET /analytics/professional  (professional only) ───────────────────────
export const getProfessionalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const [applications, myPosts, connections] = await Promise.all([
      JobApplication.find({ applicant: userId }, "status createdAt job").lean(),
      Post.find({ author: userId }, "title category likeCount commentCount viewCount createdAt").lean(),
      Connection.find(
        { $or: [{ requester: userId }, { recipient: userId }], status: "accepted" },
        "createdAt"
      ).lean(),
    ]);

    // Application status distribution
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    // Monthly application trend
    const applicationGrowth = bucketByMonth(applications, "createdAt", 6);

    // Post engagement per post (top 5)
    const postEngagement = myPosts
      .sort((a, b) => (b.likeCount + b.commentCount + b.viewCount) - (a.likeCount + a.commentCount + a.viewCount))
      .slice(0, 5)
      .map((p) => ({
        title: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title,
        likes: p.likeCount || 0,
        comments: p.commentCount || 0,
        views: p.viewCount || 0,
      }));

    // Connections growth
    const connectionGrowth = bucketByMonth(connections, "createdAt", 6);

    res.json({
      success: true,
      data: {
        totals: {
          applications: applications.length,
          myPosts: myPosts.length,
          connections: connections.length,
          totalLikes: myPosts.reduce((s, p) => s + (p.likeCount || 0), 0),
          totalViews: myPosts.reduce((s, p) => s + (p.viewCount || 0), 0),
        },
        applicationsByStatus,
        applicationGrowth,
        postEngagement,
        connectionGrowth,
      },
    });
  } catch (err) {
    console.error("Professional analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch professional analytics" });
  }
};
