import { Database } from "./database.js"
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from "./utils/build-route-path.js"
import { format } from 'date-fns';


const database = new Database()


export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
                completed_at: search,
                created_at: search,
                updated_at: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },

    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description, completed_at, created_at } = req.body
            const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

            if (!title) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'title is required' }),
                )
            }

            if (!description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'description is required' })
                )
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at,
                created_at: currentDate
            }

            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },

    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description, completed_at, created_at, updated_at } = req.body
            const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

            
            if (!title) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'title is required' }),
                )
            }

            if (!description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'description is required' })
                )
            }

            database.update('tasks', id, {
                title,
                description,
                completed_at,
                created_at,
                updated_at: currentDate
            })

            return res.writeHead(204).end()
        },
    },

    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const taskIndex = database.getIndexById('tasks', id);

            if (taskIndex !== -1) {
                // Se o ID existir, proceder com a exclusão
                database.delete('tasks', id);
                return res.writeHead(204).end();
            } else {
                // Se o ID não existir, retornar um erro 404 com uma mensagem
                return res.writeHead(404).end(JSON.stringify({ message: 'Registro não encontrado.' }));
            }
        },
    },

    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;
            const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

            const taskIndex = database.getIndexById('tasks', id);

            if (taskIndex !== -1) {
                // Atualizar a propriedade completed_at para a data e hora atuais
                const completedTask = {
                    ...database.get('tasks', taskIndex),
                    completed_at: currentDate

                };

                // Atualizar a tarefa no banco de dados
                database.update('tasks', id, completedTask);

                return res.writeHead(204).end();
            } else {
                // Se a tarefa não for encontrada, retornar um erro 404
                return res.writeHead(404).end();
            }
        }
    }

]