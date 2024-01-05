import React, { useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils";

const initialState = {
  users: [],
  loading: true,
  error: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, users: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

function HomeScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [createData, setCreateData] = useState({
    id: "",
    name: "",
    email: "",
    post: "",
    department: "",
  });
  const [updateData, setUpdateData] = useState({
    id: "",
    name: "",
    email: "",
    post: "",
    department: "",
  });
  const [deleteData, setDeleteData] = useState({
    id: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("http://localhost:3001/api/crud/read");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };
    fetchData();
  }, []);

  const clearInputs = () => {
    setCreateData({ id: "", name: "", email: "", post: "", department: "" });
    setUpdateData({
      id: "",
      name: "",
      email: "",
      post: "",
      department: "",
    });
    setDeleteData({ id: "" });
  };

  const checkLoginAndRedirect = () => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/signin");
      return false;
    }
    return true;
  };

  const getToken = () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo).token : null;
  };

  const createHeaders = () => {
    const token = getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const createUser = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }
    const { id, name, email, post, department } = createData;
    try {
      const response = await axios.post(
        "http://localhost:3001/api/crud/create",
        {
          id,
          name,
          email,
          post,
          department,
        },
        { headers: createHeaders() }
      );

      if (response.data._id) {
        toast.success("User created successfully");
      } else {
        toast.error("Error creating user");
      }
    } catch (error) {
      toast.error(error.message);
    }

    readUsers();
  };

  const updateUser = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }

    const { id, name, email, post, department } = updateData;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/crud/update/${id}`,
        { id, name, email, post, department },
        { headers: createHeaders() }
      );
      if (response.data) {
        toast.success(response.data.message);
      } else {
        toast.error("Error updating user");
      }
    } catch (error) {
      toast.error("Error updating user");
    }

    readUsers();
  };

  const deleteUser = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }

    const { id } = deleteData;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/crud/delete/${id}`,
        { headers: createHeaders() }
      );

      if (response.data) {
        toast.success(response.data.message);
      } else {
        toast.error("Error deleting user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    }

    readUsers();
  };

  const readUsers = async () => {
    try {
      const result = await axios.get("http://localhost:3001/api/crud/read", {
        headers: createHeaders(), //
      });
      dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      clearInputs();
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: getError(error) });
    }
  };

  const handleFileSystem = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/filesystem", {
        headers: createHeaders(),
      });
      const data = await response.json();

      document.getElementById(
        "fileslength"
      ).innerText = `${data.length}  files found in the directory`;

      const filesystemResultContainer =
        document.getElementById("filesystemResult");
      filesystemResultContainer.innerHTML = "";

      for (const item of data) {
        const itemElement = document.createElement("div");
        itemElement.textContent = item;
        filesystemResultContainer.appendChild(itemElement);
      }
    } catch (error) {
      toast.error("Error fetching filesystem:", error.message);
    }
  };

  const handleError = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }
    const response = await fetch("http://localhost:3001/error", {
      headers: createHeaders(),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status} - ${response.statusText}`);
      document.getElementById(
        "errorResult"
      ).innerText = `Error: ${response.status} - ${response.statusText}`;
    } else {
      const data = await response.json();
      document.getElementById("errorResult").innerText = JSON.stringify(data);
    }
  };

  const handleAsync = async () => {
    if (!checkLoginAndRedirect()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/asyncdata", {
        headers: createHeaders(),
      });
      const data = await response.json();

      const resultList = document.getElementById("asyncResult");

      data.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerText = `Id: ${item.id} - Title: ${item.title} - Description: ${item.body}`;
        resultList.appendChild(listItem);
      });
    } catch (error) {
      toast.error("Error handling asynchronous data:", error.message);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <h1>Employes Iformations</h1>
      <div className='users'>
        {state.loading ? (
          <LoadingBox />
        ) : state.error ? (
          <MessageBox variant='danger'>{state.error}</MessageBox>
        ) : (
          <Row>
            <Col>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Post</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.post}</td>
                      <td>{user.department}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}
      </div>

      <Form id='createForm' className='mt-5'>
        <h2>Create</h2>
        <Form.Group controlId='createId'>
          <Form.Label>ID:</Form.Label>
          <Form.Control
            type='text'
            value={createData.id}
            onChange={(e) =>
              setCreateData({ ...createData, id: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='createName'>
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type='text'
            value={createData.name}
            onChange={(e) =>
              setCreateData({ ...createData, name: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='createEmail'>
          <Form.Label>Email:</Form.Label>
          <Form.Control
            type='email'
            value={createData.email}
            onChange={(e) =>
              setCreateData({ ...createData, email: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='createPost'>
          <Form.Label>Post:</Form.Label>
          <Form.Control
            type='text'
            value={createData.post}
            onChange={(e) =>
              setCreateData({ ...createData, post: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='createDepartment'>
          <Form.Label>Department:</Form.Label>
          <Form.Control
            type='text'
            value={createData.department}
            onChange={(e) =>
              setCreateData({ ...createData, department: e.target.value })
            }
            required
          />
        </Form.Group>
        <Button
          variant='primary'
          className='mt-3'
          type='button'
          onClick={createUser}
        >
          Create User
        </Button>
      </Form>

      <Form id='updateForm' className='mt-5'>
        <h2>Update</h2>
        <Form.Group controlId='updateId'>
          <Form.Label>User ID:</Form.Label>
          <Form.Control
            type='text'
            value={updateData.id}
            onChange={(e) =>
              setUpdateData({ ...updateData, id: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='updateName'>
          <Form.Label>New Name:</Form.Label>
          <Form.Control
            type='text'
            value={updateData.name}
            onChange={(e) =>
              setUpdateData({ ...updateData, name: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='updateEmail'>
          <Form.Label>New Email:</Form.Label>
          <Form.Control
            type='email'
            value={updateData.email}
            onChange={(e) =>
              setUpdateData({ ...updateData, email: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='updatePost'>
          <Form.Label>New Post:</Form.Label>
          <Form.Control
            type='text'
            value={updateData.post}
            onChange={(e) =>
              setUpdateData({ ...updateData, post: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group controlId='updateDepartment'>
          <Form.Label>New Department:</Form.Label>
          <Form.Control
            type='text'
            value={updateData.department}
            onChange={(e) =>
              setUpdateData({ ...updateData, department: e.target.value })
            }
            required
          />
        </Form.Group>
        <Button
          variant='info'
          className='mt-3'
          type='button'
          onClick={updateUser}
        >
          Update User
        </Button>
      </Form>

      <Form id='deleteForm' className='mt-5 mb-5'>
        <h2>Delete</h2>
        <Form.Group controlId='deleteId'>
          <Form.Label>User ID</Form.Label>
          <Form.Control
            type='text'
            value={deleteData.id}
            onChange={(e) =>
              setDeleteData({ ...deleteData, id: e.target.value })
            }
            required
          />
        </Form.Group>
        <Button
          variant='danger'
          className='mt-3'
          type='button'
          onClick={deleteUser}
        >
          Delete User
        </Button>
      </Form>
      <Form className=' mb-5'>
        <p id='fileslength'></p>
        <div id='filesystemResult'></div>
        <Button
          variant='primary'
          className='mt-3'
          type='button'
          onClick={handleFileSystem}
        >
          File System
        </Button>
      </Form>
      <Form className=' mb-5'>
        <p id='errorResult'></p>
        <Button
          variant='warning'
          className='mt-3'
          type='button'
          onClick={handleError}
        >
          Handle Error
        </Button>
      </Form>
      <Form className=' mb-5'>
        <ul id='asyncResult'></ul>
        <Button
          variant='success'
          className='mt-3'
          type='button'
          onClick={handleAsync}
        >
          Handle Asynchronous Data
        </Button>
      </Form>
    </div>
  );
}

export default HomeScreen;
