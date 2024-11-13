import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Admins.module.css";

function Admins() {
  const { userToken: token } = useSelector((state) => state.auth);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createEditModal, setCreateEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [status, setStatus] = useState("All");

  const initialAdmin = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    permissions: {
      adminManagement: false,
      userManagement: false,
      appointmentManagement: false,
      doctorManagement: false,
      analytics: false,
    },
  };
  const [newAdmin, setNewAdmin] = useState(initialAdmin);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/admin/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch admins");

      const data = await response.json();
      console.log(data);

      setAdmins(data.admins);
      setFilteredAdmins(data.admins);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  // Filter admins
  const handleFilterChange = () => {
    const filtered = admins.filter((admin) => {
      const matchesName = `${admin.firstName} ${admin.lastName}`
        .toLowerCase()
        .includes(searchName.toLowerCase());
      return matchesName;
    });
    setFilteredAdmins(filtered);
    setCurrentPage(1);
  };

  const handleAdminClick = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  // Handle opening modal for add/edit
  const handleOpenModal = (admin = null) => {
    setSelectedAdmin(admin);
    if (admin) {
      setNewAdmin({
        ...initialAdmin,
        firstName: admin.name.firstName,
        lastName: admin.name.lastName,
        email: admin.email,
        phone: admin.phone,
        permissions: {
          ...initialAdmin.permissions,
          userManagement: admin.permissions.userManagement,
          doctorManagement: admin.permissions.doctorManagement,
          appointmentManagement: admin.permissions.appointmentManagement,
          analytics: admin.permissions.analytics,
          adminManagement: admin.permissions.adminManagement,
        },
      });
      setIsEditMode(true);
    } else {
      setNewAdmin(initialAdmin);
      setIsEditMode(false);
    }
    setCreateEditModal(true);
  };

  const handleSaveAdmin = async () => {
    const url = isEditMode
      ? `${baseURL}/admin/${selectedAdmin._id}/permissions`
      : `${baseURL}/admin/create`;
    const method = isEditMode ? "PUT" : "POST";
    const payload = newAdmin;
    delete payload.password;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) throw new Error("Failed to save admin");
      console.log(newAdmin);

      await fetchAdmins();
      setCreateEditModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setNewAdmin((prevState) => ({
      ...prevState,
      permissions: {
        ...prevState.permissions,
        [name]: checked,
      },
    }));
  };
  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    try {
      const response = await fetch(`${baseURL}/admin/delete/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete admin");

      await fetchAdmins();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.AdminsContainer}>
      <h2 className={styles.title}>Admin Management</h2>

      <div className={styles.filterSection}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button onClick={handleFilterChange}>Apply Filters</button>
        <button onClick={() => handleOpenModal()}>+ Add New Admin</button>
      </div>

      {loading && <p className={styles.loading}>Loading Admins...</p>}
      {!loading && !error && (
        <div>
          <div className={styles.admins}>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <div key={admin._id} className={styles.adminCard}>
                  <div className={styles.adminInfo}>
                    <p className={styles.name}>
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className={styles.email}>{admin.email}</p>
                  </div>
                  <div className={styles.adminActions}>
                    <button
                      onClick={() => handleAdminClick(admin)}
                      className={styles.viewDetailsButton}
                    >
                      View Details
                    </button>
                    <button onClick={() => handleOpenModal(admin)}>Edit</button>
                    <button onClick={() => handleDeleteAdmin(admin._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noAdmins}>No Admins found.</p>
            )}
          </div>
          <Pagination
            totalPosts={filteredAdmins.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}

      {isModalOpen && selectedAdmin && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className={styles.modalContent}>
            <h2 className={styles.heading}>
              {selectedAdmin.name.firstName} {selectedAdmin.name.lastName}
            </h2>
            <div>
              <table>
                <tbody>
                  <tr>
                    <th>Email</th>
                    <td>{selectedAdmin.email}</td>
                  </tr>
                  <tr className={styles.heading}>
                    <td>Permissions</td>
                  </tr>
                  <tr>
                    <th>User Management</th>
                    <td>
                      {selectedAdmin.permissions.userManagement
                        ? "true"
                        : "false"}
                    </td>
                  </tr>
                  <tr>
                    <th>Doctor Management</th>
                    <td>
                      {selectedAdmin.permissions.doctorManagement
                        ? "true"
                        : "false"}
                    </td>
                  </tr>
                  <tr>
                    <th>Appointment Management</th>
                    <td>
                      {selectedAdmin.permissions.appointmentManagement
                        ? "true"
                        : "false"}
                    </td>
                  </tr>
                  <tr>
                    <th>Analytics Management</th>
                    <td>
                      {selectedAdmin.permissions.analytics ? "true" : "false"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for add/edit admin */}
      {createEditModal && (
        <Modal onClose={() => setCreateEditModal(false)}>
          <h2>{isEditMode ? "Edit Admin" : "Add New Admin"}</h2>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">FirstName</label>
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                value={newAdmin.firstName}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, firstName: e.target.value })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Last Name"
                value={newAdmin.lastName}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, lastName: e.target.value })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
            </div>
            {!isEditMode && (
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                />
              </div>
            )}
            <h3>Permissions</h3>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="userManagement"
                  checked={newAdmin.permissions.userManagement}
                  onChange={handlePermissionChange}
                />
                User Management
              </label>
              <label>
                <input
                  type="checkbox"
                  name="doctorManagement"
                  checked={newAdmin.permissions.doctorManagement}
                  onChange={handlePermissionChange}
                />
                Doctor Management
              </label>
              <label>
                <input
                  type="checkbox"
                  name="appointmentManagement"
                  checked={newAdmin.permissions.appointmentManagement}
                  onChange={handlePermissionChange}
                />
                Appointment Management
              </label>
              <label>
                <input
                  type="checkbox"
                  name="analytics"
                  checked={newAdmin.permissions.analytics}
                  onChange={handlePermissionChange}
                />
                Analytics
              </label>
            </div>
            <button type="button" onClick={handleSaveAdmin}>
              {isEditMode ? "Update Admin" : "Add Admin"}
            </button>
          </form>
        </Modal>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default Admins;
