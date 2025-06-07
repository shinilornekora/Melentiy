
import request from 'supertest';
import express from 'express';

jest.mock('../domain/ProjectGenerator.js', () => ({
    ProjectGenerator: jest.fn(),
}));
jest.mock('../infrastructure/llm/models/yandex/utils/readSecrets.ts', () => ({
    readSecrets: jest.fn(() => ({})),
}));

import { generateProjectHandler } from '../controllers/generateProjectHandler.js';
import { ProjectGenerator } from '../domain/ProjectGenerator.js';

describe('generateProjectHandler', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Ловим ошибку двойного ответа
        app.use((req, res, next) => {
            // Флаг, чтобы не отправлять второй раз
            let finished = false;
            res.once('finish', () => { finished = true; });
            const _json = res.json;
            res.json = function (...args) {
                if (finished) return this;
                finished = true;
                return _json.apply(this, args);
            }
            next();
        });

        // Оборачиваем action так, чтобы после json сразу выходили из хендлера
        app.post(generateProjectHandler.path, (req, res) => {
            // Если обработчик сам отправляет ответ, никуда не идём дальше
            generateProjectHandler.action(req, res);
        });
    });

    it('should return 400 when no description is provided', async () => {
        await request(app)
            .post('/generate')
            .send({})
            .expect(400)
            .expect(response => {
                expect(response.body.message).toBe('Project description required');
            });
    });

    it('should return 417 when project generation fails', async () => {
        const mockGenerator = {
            generateProject: jest.fn().mockResolvedValue('ERROR'),
        };
        (ProjectGenerator as jest.Mock).mockImplementation(() => mockGenerator);

        await request(app)
            .post('/generate')
            .send({ description: 'A test project' })
            .expect(417)
            .expect(response => {
                expect(response.body.message).toBe('Project generation failed.');
            });
    });

    it('should return 200 when project generation is successful', async () => {
        const mockGenerator = {
            generateProject: jest.fn().mockResolvedValue('SUCCESS'),
        };
        (ProjectGenerator as jest.Mock).mockImplementation(() => mockGenerator);

        await request(app)
            .post('/generate')
            .send({ description: 'A test project' })
            .expect(200)
            .expect(response => {
                expect(response.body.message).toBe('Project generation ended.');
            });
    });

    it('should catch and handle errors returning 500', async () => {
        (ProjectGenerator as jest.Mock).mockImplementation(() => {
            throw new Error('Generator error');
        });

        await request(app)
            .post('/generate')
            .send({ description: 'A test project' })
            .expect(500)
            .expect(response => {
                expect(response.body.message).toBe('Critical error occurred during response.');
            });
    });
});
