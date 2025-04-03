import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const SalesChart = ({
  salesData,
}: {
  salesData: { date: string; total: number }[];
}) => {
  const data = {
    labels: salesData.map((item) => item.date),
    datasets: [
      {
        label: "Total Sales",
        data: salesData.map((item) => item.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return <Bar data={data} />;
};

export default SalesChart;
