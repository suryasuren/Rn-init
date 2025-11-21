import { SafeAreaView } from 'react-native-safe-area-context';
import { Greeting } from '../components/Greeting/Greeting';

const App = () => (
  <SafeAreaView
    edges={['top', 'bottom']}
  >
    <Greeting username="Developer" />
  </SafeAreaView>
);

export default App;
