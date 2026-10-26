
using Microsoft.AspNetCore.Mvc;
using ToDoApi.Data;
using ToDoApi.Models;

namespace ToDoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : ControllerBase
    {
        private readonly TodoRepository _repository;

        public TodosController(IConfiguration configuration)
        {
            _repository = new TodoRepository(configuration);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_repository.GetAll());
        }

        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var todo = _repository.GetById(id);

            if (todo == null)
            {
                return NotFound("Todo not found.");
            }

            return Ok(todo);
        }

        [HttpPost]
        public IActionResult Add(Todo todo)
        {
            if (string.IsNullOrWhiteSpace(todo.Title))
            {
                return BadRequest("Title is required.");
            }

            _repository.Add(todo);

            return Ok("Todo added successfully.");
        }

        [HttpPut("{id:int}")]
        public IActionResult Update(int id, Todo todo)
        {
            if (id != todo.Id)
            {
                return BadRequest("Todo ID does not match.");
            }

            if (string.IsNullOrWhiteSpace(todo.Title))
            {
                return BadRequest("Title is required.");
            }

            bool updated = _repository.Update(todo);

            if (!updated)
            {
                return NotFound("Todo not found.");
            }

            return Ok("Todo updated successfully.");
        }

        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            bool deleted = _repository.Delete(id);

            if (!deleted)
            {
                return NotFound("Todo not found.");
            }

            return Ok("Todo deleted successfully.");
        }

        [HttpGet("search")]
        public IActionResult Search(
            [FromQuery] string? search,
            [FromQuery] string? priority,
            [FromQuery] string? category)
        {
            var todos = _repository.Search(search, priority, category);

            return Ok(todos);
        }
    }
}
