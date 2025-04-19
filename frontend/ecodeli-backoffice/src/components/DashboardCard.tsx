import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  linkTo?: string;
  buttonText?: string;
  buttonVariant?: string;
  disabled?: boolean;
}

function DashboardCard({ 
  icon, 
  title, 
  description, 
  linkTo, 
  buttonText, 
  buttonVariant = "primary",
  disabled = false 
}: DashboardCardProps) {
  return (
    <div className="col-md-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <i className={`bi bi-${icon} fs-1 text-${buttonVariant} mb-3`}></i>
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{description}</p>
          {linkTo ? (
            <Link to={linkTo} className={`btn btn-${buttonVariant}`}>{buttonText}</Link>
          ) : (
            <button className={`btn btn-${buttonVariant}`} disabled={disabled}>{buttonText}</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;