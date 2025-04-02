const Dashboard = () => {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your dashboard overview and statistics will appear here.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your recent activities and updates will be shown here.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your important notifications and alerts will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
