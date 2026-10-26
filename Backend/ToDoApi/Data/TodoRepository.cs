
using Microsoft.Data.SqlClient;
using ToDoApi.Models;

namespace ToDoApi.Data
{
    public class TodoRepository
    {
        private readonly string _connectionString;

        public TodoRepository(IConfiguration configuration)
        {
            _connectionString =
                configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "Database connection string is missing.");
        }

        public List<Todo> GetAll()
        {
            List<Todo> todos = new List<Todo>();

            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = "SELECT * FROM Todos ORDER BY Id DESC";

            using SqlCommand command = new SqlCommand(query, connection);

            connection.Open();

            using SqlDataReader reader = command.ExecuteReader();

            while (reader.Read())
            {
                todos.Add(MapTodo(reader));
            }

            return todos;
        }

        public Todo? GetById(int id)
        {
            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = "SELECT * FROM Todos WHERE Id = @Id";

            using SqlCommand command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@Id", id);

            connection.Open();

            using SqlDataReader reader = command.ExecuteReader();

            if (!reader.Read())
            {
                return null;
            }

            return MapTodo(reader);
        }

        public void Add(Todo todo)
        {
            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = @"INSERT INTO Todos
                (Title, Description, Priority, Category, IsCompleted)
                VALUES
                (@Title, @Description, @Priority, @Category, @IsCompleted)";

            using SqlCommand command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@Title", todo.Title);
            command.Parameters.AddWithValue(
                "@Description",
                (object?)todo.Description ?? DBNull.Value);
            command.Parameters.AddWithValue("@Priority", todo.Priority);
            command.Parameters.AddWithValue("@Category", todo.Category);
            command.Parameters.AddWithValue(
                "@IsCompleted", todo.IsCompleted);

            connection.Open();
            command.ExecuteNonQuery();
        }

        public bool Update(Todo todo)
        {
            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = @"UPDATE Todos SET
                Title = @Title,
                Description = @Description,
                Priority = @Priority,
                Category = @Category,
                IsCompleted = @IsCompleted
                WHERE Id = @Id";

            using SqlCommand command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@Id", todo.Id);
            command.Parameters.AddWithValue("@Title", todo.Title);
            command.Parameters.AddWithValue(
                "@Description",
                (object?)todo.Description ?? DBNull.Value);
            command.Parameters.AddWithValue("@Priority", todo.Priority);
            command.Parameters.AddWithValue("@Category", todo.Category);
            command.Parameters.AddWithValue(
                "@IsCompleted", todo.IsCompleted);

            connection.Open();

            return command.ExecuteNonQuery() > 0;
        }

        public bool Delete(int id)
        {
            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = "DELETE FROM Todos WHERE Id = @Id";

            using SqlCommand command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@Id", id);

            connection.Open();

            return command.ExecuteNonQuery() > 0;
        }

        public List<Todo> Search(
            string? search,
            string? priority,
            string? category)
        {
            List<Todo> todos = new List<Todo>();

            using SqlConnection connection =
                new SqlConnection(_connectionString);

            string query = @"SELECT * FROM Todos
                WHERE (@Search IS NULL
                       OR Title LIKE '%' + @Search + '%')
                AND (@Priority IS NULL OR Priority = @Priority)
                AND (@Category IS NULL OR Category = @Category)
                ORDER BY Id DESC";

            using SqlCommand command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue(
                "@Search",
                string.IsNullOrWhiteSpace(search)
                    ? DBNull.Value
                    : search);

            command.Parameters.AddWithValue(
                "@Priority",
                string.IsNullOrWhiteSpace(priority)
                    ? DBNull.Value
                    : priority);

            command.Parameters.AddWithValue(
                "@Category",
                string.IsNullOrWhiteSpace(category)
                    ? DBNull.Value
                    : category);

            connection.Open();

            using SqlDataReader reader = command.ExecuteReader();

            while (reader.Read())
            {
                todos.Add(MapTodo(reader));
            }

            return todos;
        }

        private static Todo MapTodo(SqlDataReader reader)
        {
            return new Todo
            {
                Id = (int)reader["Id"],
                Title = (string)reader["Title"],
                Description = reader["Description"] == DBNull.Value
                    ? string.Empty
                    : (string)reader["Description"],
                Priority = (string)reader["Priority"],
                Category = (string)reader["Category"],
                IsCompleted = (bool)reader["IsCompleted"],
                CreatedAt = (DateTime)reader["CreatedAt"]
            };
        }
    }
}
