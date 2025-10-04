import React, { useState, useEffect } from 'react';
import { RoleProvider, useRole } from './components/RoleManager';
import Landing from './pages/landing';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import './App.css';

function AppContent() {
  const { user, role, loading, closeModals } = useRole();
  const [recetasPublicas, setRecetasPublicas] = useState([]);

  useEffect(() => {
    const fetchPublicRecipes = async () => {
      try {
        const response = await fetch('http://localhost:3001/recipes/public');
        const data = await response.json();
        if (response.ok) {
          setRecetasPublicas(data);
        } else {
          setRecetasPublicas([
            {
              id: 1,
              titulo: "Pasta Carbonara Clásica",
              descripcion: "La auténtica carbonara italiana con huevo, queso pecorino y panceta crujiente. Un plato tradicional romano perfecto para cualquier ocasión.",
              autor: "Chef Romano",
              comunidad: true
            },
            {
              id: 2,
              titulo: "Paella Valenciana",
              descripcion: "La paella más auténtica, con socarrat perfecto y los ingredientes tradicionales de Valencia. Un festín de sabores mediterráneos.",
              autor: "Ana Valencia",
              comunidad: true
            },
            {
              id: 3,
              titulo: "Hamburguesa Gourmet",
              descripcion: "Hamburguesa artesanal con carne premium, queso cheddar maduro y salsas caseras. La hamburguesa perfecta para los amantes de la buena comida.",
              autor: "Chef Burger",
              comunidad: true
            }
          ]);
        }
      } catch {
        setRecetasPublicas([
          {
            id: 1,
            titulo: "Pasta Carbonara Clásica",
            descripcion: "La auténtica carbonara italiana con huevo, queso pecorino y panceta crujiente. Un plato tradicional romano perfecto para cualquier ocasión.",
            autor: "Chef Romano",
            comunidad: true
          },
          {
            id: 2,
            titulo: "Paella Valenciana",
            descripcion: "La paella más auténtica, con socarrat perfecto y los ingredientes tradicionales de Valencia. Un festín de sabores mediterráneos.",
            autor: "Ana Valencia",
            comunidad: true
          },
          {
            id: 3,
            titulo: "Hamburguesa Gourmet", 
            descripcion: "Hamburguesa artesanal con carne premium, queso cheddar maduro y salsas caseras. La hamburguesa perfecta para los amantes de la buena comida.",
            autor: "Chef Burger",
            comunidad: true
          }
        ]);
      }
    };

    fetchPublicRecipes();
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          Cargando...
        </div>
      ) : (
        <>
          {(role === 'invitado' || !user) && (
            <Landing 
              recetasPublicas={recetasPublicas}
            />
          )}
          
          {role === 'usuario' && user && (
            <UserDashboard user={user} />
          )}
          
          {role === 'admin' && user && (
            <AdminPanel user={user} />
          )}
        </>
      )}

      <LoginModal />
    </div>
  );
}

function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}

export default App;
