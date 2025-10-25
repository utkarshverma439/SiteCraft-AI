import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Menu, X, User, LogOut, Plus, Home } from 'lucide-react';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  
  &:hover {
    color: #f0f0f0;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(20px);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  
  ${props => props.show ? 'display: flex;' : 'display: none;'}
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const MobileMenuLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileMenuLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <>
      <NavbarContainer>
        <NavContent>
          <Logo to="/">
            <Zap size={28} />
            SiteCraft AI
          </Logo>

          {user ? (
            <>
              <NavLinks>
                <NavLink 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  <Home size={18} style={{ marginRight: '0.5rem' }} />
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/builder" 
                  className={location.pathname === '/builder' ? 'active' : ''}
                >
                  <Plus size={18} style={{ marginRight: '0.5rem' }} />
                  New Project
                </NavLink>
              </NavLinks>

              <UserMenu>
                <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
                  <User size={18} />
                  {user.full_name || user.username}
                </UserButton>
                
                <DropdownMenu show={showUserMenu}>
                  <DropdownItem onClick={() => navigate('/dashboard')}>
                    <Home size={16} />
                    Dashboard
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </UserMenu>
            </>
          ) : (
            <NavLinks>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Get Started</NavLink>
            </NavLinks>
          )}

          <MobileMenuButton onClick={() => setShowMobileMenu(true)}>
            <Menu size={24} />
          </MobileMenuButton>
        </NavContent>
      </NavbarContainer>

      <MobileMenu show={showMobileMenu}>
        <MobileMenuHeader>
          <Logo to="/" onClick={closeMobileMenu}>
            <Zap size={28} />
            SiteCraft AI
          </Logo>
          <button 
            onClick={closeMobileMenu}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </MobileMenuHeader>

        <MobileMenuLinks>
          {user ? (
            <>
              <MobileMenuLink to="/dashboard" onClick={closeMobileMenu}>
                Dashboard
              </MobileMenuLink>
              <MobileMenuLink to="/builder" onClick={closeMobileMenu}>
                New Project
              </MobileMenuLink>
              <MobileMenuLink as="button" onClick={handleLogout} style={{ border: 'none' }}>
                Logout
              </MobileMenuLink>
            </>
          ) : (
            <>
              <MobileMenuLink to="/login" onClick={closeMobileMenu}>
                Login
              </MobileMenuLink>
              <MobileMenuLink to="/register" onClick={closeMobileMenu}>
                Get Started
              </MobileMenuLink>
            </>
          )}
        </MobileMenuLinks>
      </MobileMenu>
    </>
  );
};

export default Navbar;