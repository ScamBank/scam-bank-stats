import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Log {
  Date: string;
  RequestName: string;
  ExecutionTime: number;
  StatusCode: number;
  Description: string;
}

interface ChartData {
  date: string;
  executionTime: number;
  statusCode: number;
}

const mockData: Log[] = [
  {
    Date: "2024-03-01T10:00:00",
    RequestName: "GetBalance",
    ExecutionTime: 150,
    StatusCode: 200,
    Description: "Успешное получение баланса",
  },
  {
    Date: "2024-03-01T10:05:00",
    RequestName: "GetBalance",
    ExecutionTime: 180,
    StatusCode: 200,
    Description: "Успешное получение баланса",
  },
  {
    Date: "2024-03-01T10:10:00",
    RequestName: "GetBalance",
    ExecutionTime: 120,
    StatusCode: 500,
    Description: "Ошибка сервера",
  },
  {
    Date: "2024-03-01T10:15:00",
    RequestName: "TransferMoney",
    ExecutionTime: 250,
    StatusCode: 200,
    Description: "Успешный перевод",
  },
  {
    Date: "2024-03-01T10:20:00",
    RequestName: "TransferMoney",
    ExecutionTime: 300,
    StatusCode: 400,
    Description: "Недостаточно средств",
  },
  {
    Date: "2024-03-01T10:25:00",
    RequestName: "GetTransactions",
    ExecutionTime: 200,
    StatusCode: 200,
    Description: "Успешное получение транзакций",
  },
  {
    Date: "2024-03-01T10:30:00",
    RequestName: "GetTransactions",
    ExecutionTime: 220,
    StatusCode: 200,
    Description: "Успешное получение транзакций",
  },
  {
    Date: "2024-03-01T10:35:00",
    RequestName: "GetTransactions",
    ExecutionTime: 190,
    StatusCode: 200,
    Description: "Успешное получение транзакций",
  },
];

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center" as const,
    color: "#333",
    marginBottom: "30px",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  chartTitle: {
    color: "#444",
    fontSize: "1.5rem",
    marginBottom: "15px",
    fontWeight: "500",
  },
  loading: {
    textAlign: "center" as const,
    fontSize: "1.2rem",
    color: "#666",
    padding: "20px",
  },
  error: {
    textAlign: "center" as const,
    color: "#d32f2f",
    padding: "20px",
    backgroundColor: "#ffebee",
    borderRadius: "5px",
    margin: "20px 0",
  },
  noData: {
    textAlign: "center" as const,
    color: "#666",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
    margin: "20px 0",
  },
  mockDataWarning: {
    textAlign: "center" as const,
    color: "#f57c00",
    padding: "10px",
    backgroundColor: "#fff3e0",
    borderRadius: "5px",
    margin: "10px 0",
    fontSize: "0.9rem",
  },
};

function App() {
  const {
    data: logs,
    isLoading,
    error,
  } = useQuery<Log[]>({
    queryKey: ["Logs"],
    retry: 3,
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://cis.tsu.ru/kondakov_patterns_failures/hs/BankSystem/GetLogs"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Полученные данные:", data);
        return data;
      } catch (error) {
        console.log("Ошибка при получении данных, используем тестовые данные");
        return mockData;
      }
    },
  });

  console.log("Состояние загрузки:", isLoading);
  console.log("Ошибка:", error);
  console.log("Логи:", logs);

  if (isLoading) return <div style={styles.loading}>Загрузка данных...</div>;
  if (error) return <div style={styles.error}>Ошибка: {error.message}</div>;
  if (!logs || logs.length === 0)
    return <div style={styles.noData}>Нет данных для отображения</div>;

  // Группируем данные по RequestName
  const groupedData = logs.reduce((acc, log) => {
    if (!acc[log.RequestName]) {
      acc[log.RequestName] = [];
    }
    acc[log.RequestName].push({
      date: new Date(log.Date).toLocaleDateString(),
      executionTime: log.ExecutionTime,
      statusCode: log.StatusCode,
    });
    return acc;
  }, {} as Record<string, ChartData[]>);

  console.log("Сгруппированные данные:", groupedData);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Анализ производительности запросов</h1>
      {logs === mockData && (
        <div style={styles.mockDataWarning}>
          Внимание: используются тестовые данные
        </div>
      )}
      {Object.entries(groupedData).map(([requestName, data]) => (
        <div key={requestName} style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>{requestName}</h2>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" stroke="#666" tick={{ fill: "#666" }} />
                <YAxis yAxisId="left" stroke="#666" tick={{ fill: "#666" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#666"
                  tick={{ fill: "#666" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="executionTime"
                  stroke="#8884d8"
                  name="Время выполнения (мс)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="statusCode"
                  stroke="#82ca9d"
                  name="Код статуса"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
