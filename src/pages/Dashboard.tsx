import { useEffect, useState, useContext } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, 
  AppBar, Toolbar, Grid, Card, CardContent, Divider, Chip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Logout, Refresh, Speed, Thermostat, WaterDrop, GasMeter, Settings } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

export function Dashboard() {
  const [telemetrias, setTelemetrias] = useState<any[]>([]);
  const { signOut, user } = useContext(AuthContext);

  const carregarDados = async () => {
    try {
      const response = await api.get('/telemetria');
      // Ordenamos para o gráfico (antigo -> novo) e tabela (novo -> antigo)
      const dados = Array.isArray(response.data) ? response.data : [];
      setTelemetrias(dados);
    } catch (err) {
      console.error("Erro ao buscar dados", err);
    }
  };

  useEffect(() => {
    // Carrega os dados imediatamente ao abrir a tela
    carregarDados();

    // Define um intervalo para atualizar os dados a cada 30 segundos
    const interval = setInterval(() => {
        carregarDados();
        console.log("Dados atualizados automaticamente");
    }, 5000); // 30000ms = 30 segundos

    // Limpa o intervalo quando o usuário sai da tela (evita lentidão no navegador)
    return () => clearInterval(interval);
    }, []);

  // Preparação de dados para o Gráfico (Evolução de Umidade e Temperatura)
  const dadosGrafico = [...telemetrias].reverse().map(item => ({
    hora: new Date(item.data?.metadata?.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tempGraos: item.data?.qualidade?.temp_massa_graos || 0,
    umidadeSaida: item.data?.qualidade?.umidade_saida || 0,
    tempPlenum: item.data?.sistema_gas?.temp_plenum || 0,
  }));

  // Última leitura para os Cards de destaque
  const ultima = telemetrias[0] || {};

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: '100vh', width: '100vw' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>KNG | MONITORAMENTO AGRO</Typography>
          <Typography sx={{ mr: 2 }}>Operador: <strong>{user?.nome}</strong></Typography>
          <Button color="inherit" onClick={signOut} startIcon={<Logout />}>Sair</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        
        {/* CARDS DE DESTAQUE (KPIs Atuais) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #f44336' }}>
              <CardContent>
                <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold' }}>TEMP. MASSA GRÃOS</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Thermostat color="error" sx={{ mr: 1 }} />
                  <Typography variant="h4">{ultima.data?.qualidade?.temp_massa_graos ?? '--'}°C</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #2196f3' }}>
              <CardContent>
                <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold' }}>UMIDADE DE SAÍDA</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <WaterDrop color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h4">{ultima.data?.qualidade?.umidade_saida ?? '--'}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #4caf50' }}>
              <CardContent>
                <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold' }}>PRODUTIVIDADE</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Speed color="success" sx={{ mr: 1 }} />
                  <Typography variant="h4">{ultima.data?.kpis?.produtividade_estimada ?? '--'} <span style={{fontSize: '1rem'}}>ton/h</span></Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #ff9800' }}>
              <CardContent>
                <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 'bold' }}>SISTEMA GÁS</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <GasMeter sx={{ color: '#ff9800', mr: 1 }} />
                  <Typography variant="h5">{ultima.data?.sistema_gas?.queimador?.estado ?? 'OFF'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* GRÁFICO DE TENDÊNCIA */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>Tendência de Secagem</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line name="Temp. Grãos (°C)" type="monotone" dataKey="tempGraos" stroke="#f44336" strokeWidth={3} dot={false} />
                  <Line name="Umidade Saída (%)" type="monotone" dataKey="umidadeSaida" stroke="#2196f3" strokeWidth={3} dot={false} />
                  <Line name="Temp. Plenum (°C)" type="monotone" dataKey="tempPlenum" stroke="#4caf50" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* STATUS MECÂNICO RÁPIDO */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>Status Mecânico</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Motores (Corrente)</Typography>
                <Typography>Ventilador: <strong>{ultima.data?.mecanica?.motores?.corrente_ventilador} A</strong></Typography>
                <Typography>Exaustor: <strong>{ultima.data?.mecanica?.motores?.corrente_exaustor} A</strong></Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Pressão e Velocidade</Typography>
                <Typography>P. Estática: <strong>{ultima.data?.mecanica?.pressao_estatica} mmca</strong></Typography>
                <Typography>V. Descarga: <strong>{ultima.data?.mecanica?.velocidade_descarga} Hz</strong></Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Firmware & Hardware</Typography>
                <Typography>ID: <strong>{ultima.data?.metadata?.device_id}</strong></Typography>
                <Typography>Versão: <strong>{ultima.data?.metadata?.versao_firmware}</strong></Typography>
              </Box>
            </Paper>
          </Grid>

          {/* TABELA DETALHADA */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Histórico Completo de Telemetria</Typography>
                <Button startIcon={<Refresh />} onClick={carregarDados} variant="outlined">Atualizar Dados</Button>
              </Box>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#eee' }}>
                  <TableRow>
                    <TableCell><strong>Timestamp</strong></TableCell>
                    <TableCell align="center"><strong>Umi. Ent/Sai (%)</strong></TableCell>
                    <TableCell align="center"><strong>Temp. Grãos</strong></TableCell>
                    <TableCell align="center"><strong>Temp. Plenum</strong></TableCell>
                    <TableCell align="center"><strong>Vazão Gás</strong></TableCell>
                    <TableCell align="center"><strong>Status Geral</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {telemetrias.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{new Date(row.data?.metadata?.timestamp).toLocaleString('pt-BR')}</TableCell>
                      <TableCell align="center">
                        {row.data?.qualidade?.umidade_entrada}% → {row.data?.qualidade?.umidade_saida}%
                      </TableCell>
                      <TableCell align="center">{row.data?.qualidade?.temp_massa_graos}°C</TableCell>
                      <TableCell align="center">{row.data?.sistema_gas?.temp_plenum}°C</TableCell>
                      <TableCell align="center">{row.data?.sistema_gas?.vazao_instantanea} kg/h</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={row.data?.metadata?.status_geral} 
                          size="small"
                          color={row.data?.metadata?.status_geral === 'OK' ? 'success' : 'warning'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}