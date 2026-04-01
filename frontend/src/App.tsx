import { PerfectMainPage } from './pages/PerfectMainPage';

function App() {
  // Perfect configuration
  const isAdmin = false; // Change to true to see admin view
  const userId = 'user-123';
  const userName = 'John Doe';
  const userRole = 'Student';

  return (
    <PerfectMainPage 
      isAdmin={isAdmin} 
      userId={userId}
      userName={userName}
      userRole={userRole}
    />
  );
}

export default App;
