// src/App.js
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import store from './store';
import TaskList from './tasklist'; // Importa TaskList

import logo from './logo.svg';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          
          {/* Renderizamos el componente TaskList */}
          <TaskList />
        </div>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
