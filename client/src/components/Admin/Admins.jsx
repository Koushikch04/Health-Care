import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Admins.module.css";

const INITIAL_ADMIN = {
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

function Admins() {
  const { userToken: token } = useSelector((state) => state.auth);

  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formAdmin, setFormAdmin] = useState(INITIAL_ADMIN);

  /* ================= FETCH ================= */
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseURL}/admin/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch admins");

      const data = await res.json();
      setAdmins(data.admins);
      setFilteredAdmins(data.admins);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  /* ================= FILTER ================= */
  const applyFilters = () => {
    const filtered = admins.filter((admin) =>
      `${admin.firstName} ${admin.lastName}`
        .toLowerCase()
        .includes(searchName.toLowerCase()),
    );

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  };

  /* ================= PAGINATION ================= */
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstPost, indexOfLastPost);

  /* ================= MODALS ================= */
  const openViewModal = (admin) => {
    setSelectedAdmin(admin);
    setIsViewModalOpen(true);
  };

  const openCreateModal = () => {
    setError(null);
    setIsEditMode(false);
    setFormAdmin(INITIAL_ADMIN);
    setIsFormModalOpen(true);
  };

  const openEditModal = (admin) => {
    setError(null);
    setIsEditMode(true);
    setSelectedAdmin(admin);

    setFormAdmin({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: "",
      permissions: { ...admin.permissions },
    });

    setIsFormModalOpen(true);
  };

  /* ================= FORM ================= */
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormAdmin((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };

  const validateForm = () => {
    if (!formAdmin.firstName.trim()) return "First name is required";
    if (!formAdmin.lastName.trim()) return "Last name is required";
    if (!formAdmin.email.trim()) return "Email is required";

    if (!isEditMode && !formAdmin.password.trim()) {
      return "Password is required for new admins";
    }

    return null;
  };

  const handleSaveAdmin = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const url = isEditMode
      ? `${baseURL}/admin/${selectedAdmin._id}/permissions`
      : `${baseURL}/admin/create`;

    const method = isEditMode ? "PUT" : "POST";

    const payload = isEditMode
      ? { permissions: formAdmin.permissions }
      : formAdmin;
    const previousAdmins = admins;
    const previousFilteredAdmins = filteredAdmins;

    if (isEditMode && selectedAdmin) {
      const optimisticUpdatedAdmin = {
        ...selectedAdmin,
        firstName: formAdmin.firstName || selectedAdmin.firstName,
        lastName: formAdmin.lastName || selectedAdmin.lastName,
        email: formAdmin.email || selectedAdmin.email,
        permissions: { ...formAdmin.permissions },
      };

      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === selectedAdmin._id ? optimisticUpdatedAdmin : admin,
        ),
      );
      setFilteredAdmins((prev) =>
        prev.map((admin) =>
          admin._id === selectedAdmin._id ? optimisticUpdatedAdmin : admin,
        ),
      );
    } else if (!isEditMode) {
      const optimisticAdmin = {
        _id: `temp-${Date.now()}`,
        firstName: formAdmin.firstName,
        lastName: formAdmin.lastName,
        email: formAdmin.email,
        permissions: { ...formAdmin.permissions },
      };
      setAdmins((prev) => [optimisticAdmin, ...prev]);
      setFilteredAdmins((prev) => [optimisticAdmin, ...prev]);
    }

    setIsFormModalOpen(false);
    setError(null);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save admin");

      await fetchAdmins();
    } catch (err) {
      setAdmins(previousAdmins);
      setFilteredAdmins(previousFilteredAdmins);
      setError(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteAdmin = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this admin? This action cannot be undone.",
    );

    if (!confirmed) return;
    const previousAdmins = admins;
    const previousFilteredAdmins = filteredAdmins;
    setAdmins((prev) => prev.filter((admin) => admin._id !== id));
    setFilteredAdmins((prev) => prev.filter((admin) => admin._id !== id));

    try {
      const res = await fetch(`${baseURL}/admin/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete admin");
    } catch (err) {
      setAdmins(previousAdmins);
      setFilteredAdmins(previousFilteredAdmins);
      setError(err.message);
    }
  };

  /* ================= RENDER ================= */
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
        <button onClick={applyFilters}>Apply Filters</button>
        <button onClick={openCreateModal}>+ Add New Admin</button>
      </div>

      {loading && <p className={styles.loading}>Loading Admins...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.admins}>
            {currentAdmins.length === 0 && (
              <p className={styles.noAdmins}>No Admins found.</p>
            )}

            {currentAdmins.map((admin) => (
              <div key={admin._id} className={styles.adminCard}>
                <div className={styles.adminInfo}>
                  <p className={styles.name}>
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className={styles.email}>{admin.email}</p>
                </div>

                <div className={styles.adminActions}>
                  <button onClick={() => openViewModal(admin)}>
                    View Details
                  </button>
                  <button onClick={() => openEditModal(admin)}>Edit</button>
                  <button onClick={() => handleDeleteAdmin(admin._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            totalPosts={filteredAdmins.length}
            postsPerPage={postsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedAdmin && (
        <Modal onClose={() => setIsViewModalOpen(false)}>
          <div className={styles.modalContent}>
            <h2 className={styles.heading}>
              {selectedAdmin.firstName} {selectedAdmin.lastName}
            </h2>

            <table>
              <tbody>
                <tr>
                  <th>Email</th>
                  <td>{selectedAdmin.email}</td>
                </tr>

                <tr className={styles.heading}>
                  <td>Permissions</td>
                </tr>

                {Object.entries(selectedAdmin.permissions).map(
                  ([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value ? "true" : "false"}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <Modal onClose={() => setIsFormModalOpen(false)}>
          <h2>{isEditMode ? "Edit Admin" : "Add New Admin"}</h2>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                value={formAdmin.firstName}
                onChange={(e) =>
                  setFormAdmin({ ...formAdmin, firstName: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                value={formAdmin.lastName}
                onChange={(e) =>
                  setFormAdmin({ ...formAdmin, lastName: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={formAdmin.email}
                onChange={(e) =>
                  setFormAdmin({ ...formAdmin, email: e.target.value })
                }
              />
            </div>

            {!isEditMode && (
              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  value={formAdmin.password}
                  onChange={(e) =>
                    setFormAdmin({
                      ...formAdmin,
                      password: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <h3>Permissions</h3>
            <div className={styles.formGroup}>
              {Object.keys(formAdmin.permissions).map((perm) => (
                <label key={perm}>
                  <input
                    type="checkbox"
                    name={perm}
                    checked={formAdmin.permissions[perm]}
                    onChange={handlePermissionChange}
                  />
                  {perm}
                </label>
              ))}
            </div>

            <button type="button" onClick={handleSaveAdmin}>
              {isEditMode ? "Update Admin" : "Add Admin"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Admins;
