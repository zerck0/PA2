import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { getUserProfileActions, UserAction } from '../config/menuConfig';

interface UserProfileMenuProps {
  user: {
    prenom: string;
    nom: string;
    role: string;
  };
  onLogout: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onLogout }) => {
  const { requireAuth } = useAuthGuard();
  const navigate = useNavigate();
  
  const userActions = getUserProfileActions(user.role);

  const handleActionClick = (action: UserAction) => {
    if (action.action === 'logout') {
      onLogout();
      return;
    }

    if (action.path) {
      requireAuth(() => {
        navigate(action.path!);
      });
    }
  };

  const renderAction = (action: UserAction, index: number) => {
    const iconClass = `bi ${action.icon} me-2`;
    
    if (action.divider && index > 0) {
      return (
        <React.Fragment key={index}>
          <NavDropdown.Divider />
          {action.action ? (
            <NavDropdown.Item onClick={() => handleActionClick(action)}>
              <i className={iconClass}></i>
              {action.label}
            </NavDropdown.Item>
          ) : (
            <NavDropdown.Item as={Link} to={action.path!}>
              <i className={iconClass}></i>
              {action.label}
            </NavDropdown.Item>
          )}
        </React.Fragment>
      );
    }

    return action.action ? (
      <NavDropdown.Item key={index} onClick={() => handleActionClick(action)}>
        <i className={iconClass}></i>
        {action.label}
      </NavDropdown.Item>
    ) : (
      <NavDropdown.Item key={index} as={Link} to={action.path!}>
        <i className={iconClass}></i>
        {action.label}
      </NavDropdown.Item>
    );
  };

  return (
    <NavDropdown 
      title={
        <span>
          <i className="bi bi-person-circle me-2"></i>
          {user.prenom} {user.nom}
        </span>
      } 
      id="user-profile-dropdown"
      className="navbar-dropdown"
      align="end"
    >
      {userActions.map((action, index) => renderAction(action, index))}
    </NavDropdown>
  );
};

export default UserProfileMenu;
