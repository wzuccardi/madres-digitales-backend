const axios = require('axios')

async function main() {
  const base = 'http://localhost:3000'
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTc2Mzc5MTM2NzQ0OV80MGd6ZnciLCJlbWFpbCI6ImNyZXB1QGdtYWlsLmNvbSIsInJvbCI6Ik1BRFJJTkEiLCJpYXQiOjE3NjM3OTE4NzIsImV4cCI6MTc2Mzg3ODI3MiwiYXVkIjoibWFkcmVzLWRpZ2l0YWxlcy11c2VycyIsImlzcyI6Im1hZHJlcy1kaWdpdGFsZXMifQ.I2DcOGtdEHi8xUsSOhobN49nysLtuAxikofQvczpNjQ'
  const headers = { Authorization: token, Accept: 'application/json' }
  try {
    const gestantes = await axios.get(`${base}/api/gestantes`, { params: { limit: 20, page: 1 }, headers })
    console.log('GET /api/gestantes status:', gestantes.status)
    console.log('gestantes sample:', Array.isArray(gestantes.data?.data) ? gestantes.data.data.slice(0,2) : gestantes.data)
  } catch (e) {
    console.error('Error GET /api/gestantes:', e.response ? e.response.status : e.message, e.response ? e.response.data : '')
  }
  try {
    const userId = 'user_1763791367449_40gzfw'
    const unread = await axios.get(`${base}/api/alertas/${userId}/unread/count`, { headers })
    console.log('GET /api/alertas/:userId/unread/count status:', unread.status)
    console.log('unread:', unread.data)
  } catch (e) {
    console.error('Error GET unread count:', e.response ? e.response.status : e.message, e.response ? e.response.data : '')
  }
}

main()
