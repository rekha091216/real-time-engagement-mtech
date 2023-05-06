import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeScreen from '../src/frontpage.png';
import { useNavigate } from "react-router-dom";
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel, FormGroup } from '@mui/material';

const theme = createTheme();

export default function SignInSide() {
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const userName = data.get('userName');
    const roomName = data.get('roomName');
    const isCameraEnabled = data.get('camera');
    const isMicrophoneEnabled = data.get('microphone');
    if (userName === "" || roomName === "") return; 
    
    navigate("/videoCall", {
        state: {
          userName: userName,
          roomName: roomName,
          isCameraEnabled: isCameraEnabled,
          isMicrophoneEnabled: isMicrophoneEnabled
        }
      });
  }
  
  const onRegister = () => {
    navigate("/register");
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${HomeScreen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
              <h3>Real-time Enagagement</h3>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <HandshakeIcon />
            </Avatar>
            <Typography component="h1" variant="h5"/>
            <Box component="form" noValidate  sx={{ mt: 1 }} onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="userName"
                label="User Name"
                name="userName"
                autoComplete="userName"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="roomName"
                label="Room Name"
                id="roomName"
              />
              <FormGroup>
                <FormControlLabel control={<Checkbox name="camera"/>} label="Turn on Camera" ></FormControlLabel>
                <FormControlLabel control={<Checkbox name="microphone"/>} label="Turn on Microphone" ></FormControlLabel>
              </FormGroup>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
               Join Meeting
              </Button>
               <Button
                fullWidth
                variant="contained"
                style={{backgroundColor:'purple'}}
                sx={{ mt: 3, mb: 2 }}
                onClick={onRegister}
              >
               Register
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}