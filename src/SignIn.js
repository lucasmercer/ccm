import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import background from './colegio_bg.png'

import { useNavigate } from 'react-router-dom'
import { Alert } from '@mui/material'

function Copyright(props) {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}
    >
      {'Copyright © '}
      <Link color='inherit'>Lucas Mercer</Link> {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme()

function SignInSide() {
  const [email, setEmail] = React.useState('')
  const [senha, setSenha] = React.useState('')
  const [rememberUser, setRememberUser] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    const storedPassword = localStorage.getItem('userPassword')
    if (storedEmail) {
      setEmail(storedEmail)
      setSenha(storedPassword)
      setRememberUser(true)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (email === 'lucas@escola.com' && senha === 'Senha123') {
      if (rememberUser) {
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userPassword', senha)
      } else {
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userPassword')
      }
      navigate('/certificado')
      setIsError(false)
    } else {
      setIsError(true)
    }
  }

  React.useEffect(() => {
    if (isError) {
      setTimeout(() => {
        setIsError(false)
      }, [3000])
    }
  }, [isError])

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component='main' sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light'
                ? t.palette.grey[50]
                : t.palette.grey[900],
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
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component='h1' variant='h5'>
              Area de login
            </Typography>
            <Box
              component='form'
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                error={isError}
                margin='normal'
                required
                fullWidth
                id='email'
                label='Endereço Email'
                name='email'
                autoComplete='email'
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                error={isError}
                margin='normal'
                required
                fullWidth
                name='senha'
                label='Senha'
                type='password' // alterado de "Senha" para "password"
                id='senha'
                autoComplete='current-password'
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberUser}
                    onChange={() => setRememberUser(!rememberUser)}
                    value='remember'
                    color='primary'
                  />
                }
                label='Lembrar do usuário'
              />
              {isError && <Alert severity='error'>Usuário inválido</Alert>}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                color={isError ? 'error' : 'primary'}
                sx={{ mt: 3, mb: 2 }}
              >
                {isError ? 'Usuario inexistente' : 'Entrar'}
              </Button>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export { SignInSide }
