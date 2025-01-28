import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import Annotator from './Components/Annotator/Annotator';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Annotator />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;