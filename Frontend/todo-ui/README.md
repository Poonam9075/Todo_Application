# Todo Application

A simple Todo Management Application built using React.js, C# .NET Web API, and Microsoft SQL Server.

## Features

- Create a todo with a title and description
- Set priority: High, Medium, or Low
- Select category: Work or Personal
- View all todos
- Search todos by title or description
- Filter todos by category
- Edit and delete todos
- Mark todos as completed or pending
- Handle API errors with helpful messages

## Technologies Used

**Frontend**
- React.js
- JavaScript
- HTML and CSS
- Vite

**Backend**
- C#
- ASP.NET Core Web API (.NET 10)

**Database**
- Microsoft SQL Server LocalDB
- ADO.NET

## Project Setup

### 1. Start the Backend

1. Open the `ToDoApi` project in Visual Studio.
2. Verify the SQL Server connection string in `appsettings.json`.
3. Ensure the `TodoDB` database and `dbo.Todos` table exist.
4. Run the project using Visual Studio.

### 2. Start the Frontend

Open a terminal in the `todo-ui` folder and run:

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually `http://localhost:5173`.

## Database Configuration

The application uses SQL Server LocalDB with a database named `TodoDB` and a table named `dbo.Todos`.

Configure the connection string in the backend's `appsettings.json` if your SQL Server instance differs.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/Todos` | Get all todos |
| POST | `/api/Todos` | Create a todo |
| GET | `/api/Todos/search?search=Complete&priority=High&category=Work` | Search and filter todos |
| PUT | `/api/Todos/{id}` | Update a todo |
| DELETE | `/api/Todos/{id}` | Delete a todo |

## Notes

- Start the backend before using the frontend.
- The frontend API URL must match the URL used by the backend.
- Database records are stored in SQL Server.
