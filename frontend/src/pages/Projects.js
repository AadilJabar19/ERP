import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import Modal from '../components/Modal';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Projects = () => {
  const { hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', client: '', manager: '',
    startDate: '', endDate: '', budget: '', status: 'planning', priority: 'medium'
  });

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
      fetchEmployees();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hrm/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const employeeData = response.data.employees || response.data.items || response.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/projects', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: '', code: '', description: '', client: '', manager: '',
        startDate: '', endDate: '', budget: '', status: 'planning', priority: 'medium'
      });
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      planning: '#6c757d', active: '#28a745', 'on-hold': '#ffc107',
      completed: '#17a2b8', cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = { low: '#28a745', medium: '#ffc107', high: '#fd7e14', critical: '#dc3545' };
    return colors[priority] || '#6c757d';
  };

  const renderProjects = () => (
    <div>
      {hasRole(['admin', 'manager']) && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: '20px' }}>
          Add Project
        </button>
      )}

      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOptions={[
          { value: 'planning', label: 'Planning' },
          { value: 'active', label: 'Active' },
          { value: 'on-hold', label: 'On Hold' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]}
        selectedFilter={filterStatus}
        setSelectedFilter={setFilterStatus}
      />

      <div className="card">
        <h3>Projects Overview</h3>
        {loading ? <LoadingSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Manager</th>
                  <th>Budget</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project._id}>
                    <td>{project.code}</td>
                    <td>{project.name}</td>
                    <td>{project.client}</td>
                    <td>{project.manager?.name}</td>
                    <td>${project.budget?.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '100px', height: '8px', backgroundColor: '#e9ecef', 
                          borderRadius: '4px', overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${project.progress}%`, height: '100%', 
                            backgroundColor: '#28a745', transition: 'width 0.3s' 
                          }}></div>
                        </div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: getStatusColor(project.status), color: 'white'
                      }}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        backgroundColor: getPriorityColor(project.priority), color: 'white'
                      }}>
                        {project.priority}
                      </span>
                    </td>
                    <td>{new Date(project.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderAnalytics = () => {
    const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
    
    const statusData = analytics.statusStats?.map(status => ({
      name: status._id,
      count: status.count,
      totalBudget: status.totalBudget || 0
    })) || [];
    
    const priorityData = analytics.priorityStats?.map(priority => ({
      name: priority._id,
      count: priority.count
    })) || [];
    
    const progressData = analytics.progressStats?.map(progress => ({
      range: progress._id,
      count: progress.count
    })) || [];
    
    return (
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          📊 Project Analytics Dashboard
        </h3>
        
        <div className="grid-stats" style={{ marginBottom: '30px' }}>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📁</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Projects</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{analytics.totalProjects || 0}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Active Projects</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>
                  {analytics.statusStats?.find(s => s._id === 'active')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>💰</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Total Budget</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>${(analytics.totalBudget || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>📈</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Avg Progress</h4>
                <p style={{ fontSize: '2rem', margin: '5px 0', color: 'white' }}>{(analytics.avgProgress || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Project Status Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3498db" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🥧 Priority Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📈 Budget by Status
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Budget']} />
                <Legend />
                <Line type="monotone" dataKey="totalBudget" stroke="#e74c3c" strokeWidth={3} name="Total Budget" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              📉 Progress Distribution
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2ecc71" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="page-container">
      <h1 className="page-title">Project Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('projects')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📁 Projects
        </button>
        {hasRole(['admin', 'manager']) && (
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {activeTab === 'projects' && renderProjects()}
      {activeTab === 'analytics' && renderAnalytics()}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Project">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Project Name:</label>
              <input type="text" value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Project Code:</label>
              <input type="text" value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Client:</label>
            <input type="text" value={formData.client} 
              onChange={(e) => setFormData({...formData, client: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Project Manager:</label>
            <select value={formData.manager} 
              onChange={(e) => setFormData({...formData, manager: e.target.value})} required>
              <option value="">Select Manager</option>
              {(employees || []).map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name || emp.personalInfo?.firstName + ' ' + emp.personalInfo?.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date:</label>
              <input type="date" value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input type="date" value={formData.endDate} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget:</label>
              <input type="number" value={formData.budget} 
                onChange={(e) => setFormData({...formData, budget: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-success">Create Project</button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;