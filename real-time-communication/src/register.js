import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import HomeScreen from "../src/frontpage.png";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { AccountBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { useState } from "react";

const theme = createTheme();

export default function Register() {
  const navigate = useNavigate();
  const [isPwdMatching, setIsPwdMatching] = useState("hidden");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const userName = data.get("userName");
    const confirmPassword = data.get("confirmpassword");
    const password = data.get("password");
    
    if (userName === "" || password === "" || confirmPassword === "") return; 

    if (password !== confirmPassword) {
      // eslint-disable-next-line no-const-assign
      setIsPwdMatching("visible");
    } else {
      setIsPwdMatching("hidden");
      chatRegister(userName, password);
      navigate("/");
    }
  };

  const chatRegister = async (userName, password) => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      mode: "no-cors",
    };

    const registeruUrl =
      "http://localhost:3030/register?account=" +
      userName +
      "&password=" +
      userName;
    let encoded = encodeURIComponent(registeruUrl);
    let decoded = decodeURIComponent(encoded).trim();

    fetch(decoded, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        console.log("chat registration success");
        navigate("/");
      })
      .catch((error) => {
        console.log("Chat Registration Failed", error);
      });

    //Add user to the group

    const addUseruUrl = "http://localhost:3030/addUser?userName=" + userName;
    encoded = encodeURIComponent(addUseruUrl);
    decoded = decodeURIComponent(encoded).trim();

    fetch(decoded, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        console.log("added user to group success");
        navigate("/");
      })
      .catch((error) => {
        console.log("added user to group failed", error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${HomeScreen})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3>Real-time Enagagement</h3>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <AccountBox />
            </Avatar>
            <h4>Registration</h4>
            <Typography component="h1" variant="h5" />
            <Box
              component="form"
              noValidate
              sx={{ mt: 1 }}
              onSubmit={handleSubmit}
            >
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
                name="password"
                label="Password"
                id="password"
                type="password"
                autoComplete="new-password"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmpassword"
                label="Confirm Password"
                id="confirmpassword"
                type="password"
                autoComplete="new-password"
              />
              <Alert style={{ visibility: isPwdMatching }} severity="warning">
                Passwords are not matching
              </Alert>
              <Button
                fullWidth
                variant="contained"
                style={{ backgroundColor: "purple" }}
                sx={{ mt: 3, mb: 2 }}
                type="submit"
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