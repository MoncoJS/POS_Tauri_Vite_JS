import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Title } from "chart.js";

ChartJS.register(ArcElement, Title);

const StockChart = ({
  stockLevels,
}: {
  stockLevels: { [key: number]: number };
}) => {
  const data = {
    labels: Object.keys(stockLevels).map((id) => `Product ID ${id}`),
    datasets: [
      {
        label: "Stock Levels",
        data: Object.values(stockLevels),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return <Pie data={data} />;
};

export default StockChart;
