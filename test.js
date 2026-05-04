const request = require('supertest');
const app = require('./server');

jest.mock('./db', () => ({
  query: jest.fn()
}));

const { query } = require('./db');

describe('Sensors API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sensors', () => {
    it('should return all sensors', async () => {
      const mockSensors = [
        { id: 1, name: 'Sensor1', coordinates: '0,0', type: 'temp', value: 25 },
        { id: 2, name: 'Sensor2', coordinates: '1,1', type: 'humidity', value: 60 }
      ];
      query.mockResolvedValue({ rows: mockSensors });

      const response = await request(app).get('/api/sensors');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensors);
      expect(query).toHaveBeenCalledWith('SELECT * FROM exam ORDER BY id ASC');
    });

    it('should return 500 on database error', async () => {
      query.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/sensors');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /api/sensors/:id', () => {
    it('should return a sensor by id', async () => {
      const mockSensor = { id: 1, name: 'Sensor1', coordinates: '0,0', type: 'temp', value: 25 };
      query.mockResolvedValue({ rows: [mockSensor] });

      const response = await request(app).get('/api/sensors/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensor);
      expect(query).toHaveBeenCalledWith('SELECT * FROM exam WHERE id = $1', ['1']);
    });

    it('should return 404 if sensor not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/sensors/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Sensor not found' });
    });

    it('should return 500 on database error', async () => {
      query.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/sensors/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /api/sensors', () => {
    it('should create a new sensor', async () => {
      const newSensor = { name: 'Sensor3', coordinates: '2,2', type: 'pressure', value: 1013 };
      const mockResult = { id: 3, ...newSensor };
      query.mockResolvedValue({ rows: [mockResult] });

      const response = await request(app)
        .post('/api/sensors')
        .send(newSensor);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO exam (name, coordinates, type, value) VALUES ($1, $2, $3, $4) RETURNING *',
        [newSensor.name, newSensor.coordinates, newSensor.type, newSensor.value]
      );
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/sensors')
        .send({ name: 'Sensor3' }); // missing fields

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid input' });
    });

    it('should return 500 on database error', async () => {
      query.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/sensors')
        .send({ name: 'Sensor3', coordinates: '2,2', type: 'pressure', value: 1013 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /api/sensors/:id', () => {
    it('should update a sensor', async () => {
      const updatedSensor = { id: 1, name: 'UpdatedSensor', coordinates: '0,0', type: 'temp', value: 26 };
      query.mockResolvedValue({ rows: [updatedSensor] });

      const response = await request(app)
        .put('/api/sensors/1')
        .send({ name: 'UpdatedSensor', value: 26 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedSensor);
      expect(query).toHaveBeenCalledWith(
        'UPDATE exam SET name = COALESCE($1, name), coordinates = COALESCE($2, coordinates), type = COALESCE($3, type), value = COALESCE($4, value) WHERE id = $5 RETURNING *',
        ['UpdatedSensor', undefined, undefined, 26, '1']
      );
    });

    it('should return 404 if sensor not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/sensors/999')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should return 500 on database error', async () => {
      query.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/sensors/1')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('DELETE /api/sensors/:id', () => {
    it('should delete a sensor', async () => {
      const mockSensor = { id: 1, name: 'Sensor1', coordinates: '0,0', type: 'temp', value: 25 };
      query.mockResolvedValue({ rows: [mockSensor] });

      const response = await request(app).delete('/api/sensors/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Product deleted' });
      expect(query).toHaveBeenCalledWith('DELETE FROM exam WHERE id = $1 RETURNING *', ['1']);
    });

    it('should return 404 if sensor not found', async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app).delete('/api/sensors/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should return 500 on database error', async () => {
      query.mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/sensors/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });
});

