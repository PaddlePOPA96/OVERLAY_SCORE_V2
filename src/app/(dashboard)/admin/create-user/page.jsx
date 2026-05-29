"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut } from "firebase/auth";


// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

import {
  registerWithEmailPassword,
  updateUserRole,
  deleteUserFromDb,
  syncUserToFirestore,
} from "@/lib/auth/service";
import { useAllUsers } from "@/features/iam/hooks/useAllUsers";
import { auth } from "@/lib/firebaseAuth";

const ADMIN_EMAIL = "admin@admin.com";

export default function AdminUserManagementPage() {
  const router = useRouter();
  
  // Synchronously initialize state with active user session to bypass verification delay
  const [ready, setReady] = useState(!!auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(auth.currentUser?.email === ADMIN_EMAIL);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);

  // Form States for creating new accounts
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [createStatus, setCreateStatus] = useState({ type: "", message: "" });

  const { users, loading: loadingUsers } = useAllUsers();

  useEffect(() => {
    // Optimize: Proactively sync admin user to Firestore on mount if session is active
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      syncUserToFirestore(auth.currentUser).catch(console.error);
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        
return;
      }

      const isAdminUser = user.email === ADMIN_EMAIL;

      setIsAdmin(isAdminUser);
      setCurrentUserId(user.uid);
      setReady(true);

      // Sync the admin's own profile to Firestore if not already present
      if (isAdminUser) {
        syncUserToFirestore(user).catch(console.error);
      }
    });

    
return () => unsub();
  }, [router]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateStatus({ type: "", message: "" });

    if (password !== confirmPassword) {
      setCreateStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      
return;
    }

    setLoading(true);

    try {
      await registerWithEmailPassword(email, password);
      setCreateStatus({
        type: "success",
        message: "User successfully created! Note: Firebase signs in new users automatically. Please sign out and sign back in as admin to manage other accounts.",
      });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setCreateStatus({
        type: "error",
        message: error?.message || "Failed to create new user account.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <div className="p-6 text-slate-500 text-sm">Verifying admin session...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert severity="error" className="mb-4">
          Access Denied. This section is strictly reserved for the Superuser admin.
        </Alert>
        <Button variant="contained" onClick={() => router.push("/")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management Console</h1>
        <p className="text-slate-500 text-sm">Create new operator profiles, toggle roles, and manage active system accounts.</p>
      </div>

      <Grid container spacing={6}>
        {/* Create User Form Card */}
        <Grid item xs={12} md={5}>
          <Card className="border border-slate-700/20 bg-slate-50 shadow-sm rounded-xl">
            <CardHeader title="Create New Account" subheader="Add a new operator to the system" />
            <CardContent className="space-y-4">
              {createStatus.message && (
                <Alert severity={createStatus.type === "error" ? "error" : "success"} className="text-xs">
                  {createStatus.message}
                </Alert>
              )}
              <form onSubmit={handleCreateUser} className="space-y-4">
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@example.com"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                  size="small"
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  className="font-semibold text-sm normal-case mt-2"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Users List Card */}
        <Grid item xs={12} md={7}>
          <Card className="border border-slate-700/20 bg-slate-50 shadow-sm rounded-xl">
            <CardHeader
              title={`Registered Accounts (${users.length})`}
              subheader="List of synchronized Firestore user profiles"
            />
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-6 text-slate-400 text-sm">Loading users list...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">No users found.</div>
              ) : (
                <TableContainer component={Paper} className="border border-slate-200/50 shadow-none rounded-lg">
                  <Table size="small">
                    <TableHead className="bg-slate-100">
                      <TableRow>
                        <TableCell className="font-semibold text-xs py-3">Email</TableCell>
                        <TableCell className="font-semibold text-xs py-3">Role</TableCell>
                        <TableCell className="font-semibold text-xs py-3 align-middle text-right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((row) => (
                        <UserRowItem
                          key={row.uid}
                          row={row}
                          isMe={row.uid === currentUserId}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

function UserRowItem({ row, isMe }) {
  const [role, setRole] = useState(row.role || "user");
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleRoleToggle = async (newRole) => {
    if (isMe) return;
    setSaving(true);
    setRole(newRole);

    try {
      await updateUserRole(row.uid, newRole);
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (isMe) return;
    const confirm = window.confirm(`Are you sure you want to permanently delete user: ${row.email}?`);

    if (!confirm) return;

    setSaving(true);

    try {
      await deleteUserFromDb(row.uid);
      setDeleted(true);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user: " + err.message);
      setSaving(false);
    }
  };

  if (deleted) return null;

  return (
    <TableRow hover>
      <TableCell className="py-2.5">
        <Typography variant="body2" className="font-medium text-slate-800">
          {row.email}
        </Typography>
        {isMe && (
          <span className="inline-block mt-0.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
            You
          </span>
        )}
      </TableCell>
      <TableCell className="py-2.5">
        {isMe ? (
          <span className="capitalize text-slate-400 italic text-xs">{role}</span>
        ) : (
          <Select
            value={role}
            onChange={(e) => handleRoleToggle(e.target.value)}
            disabled={saving}
            size="small"
            className="text-xs bg-white"
            sx={{ height: 30, fontSize: 12 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superadmin">Super Admin</MenuItem>
          </Select>
        )}
      </TableCell>
      <TableCell className="py-2.5 text-right">
        {isMe ? (
          <span className="text-xs text-slate-400 italic">Self</span>
        ) : (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleDeleteUser}
            disabled={saving}
            className="normal-case text-xs font-semibold px-2 py-0.5 min-w-0"
            sx={{ height: 26 }}
          >
            {saving ? "..." : "Delete"}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
