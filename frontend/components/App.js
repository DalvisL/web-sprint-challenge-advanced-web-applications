import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { axiosWithAuth } from '../axios/index.js';
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import PrivateRoute from './PrivateRoute.js';

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => {
    navigate('/')
   }
  const redirectToArticles = () => { 
    navigate('/articles')
   }
  
   // function that finds the current article
  const findCurrentArticle = () => {
      if (!currentArticleId || !articles) {
        return null;
      }
      return articles.find(art => art.article_id === currentArticleId);
    }
  const currentArticle = findCurrentArticle();

  const logout = () => {
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  }

  const login = ({ username, password }) => {

    setMessage('');
    setSpinnerOn(true);
    axios.post(loginUrl, {username, password})
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.message);
        redirectToArticles();
        setSpinnerOn(false);
      })
      .catch(err => {
        console.log(err);
        setMessage(err.message);
        setSpinnerOn(false);
      })
  }

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth().get(articlesUrl)
      .then(res => {
        setArticles(res.data.articles);
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch(err => {
        console.log(err);
        setMessage(err.message);
        navigate('/');
        setSpinnerOn(false); 
      })
  }

  const postArticle = article => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth().post(articlesUrl, article)
      .then(res => {
        setArticles([...articles, res.data.article])
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch(err => {
        console.log(err);
        setMessage(err.message);
        setSpinnerOn(false);
      })
  }

  const updateArticle = ({ article_id, article }) => {
    setSpinnerOn(true);
    axiosWithAuth().put(`${articlesUrl}/${article_id}`, article)
      .then(res => {
        const updatedArticle = res.data.article;
        setArticles(prevArticles => {
          return prevArticles.map((art) => 
            art.article_id === article_id ? updatedArticle : art
          );
        });
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch(err => {
        console.log(err);
        setMessage(err.message);
        setSpinnerOn(false);
      })
  }

  const deleteArticle = article_id => {
    setSpinnerOn(true);
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        setArticles(prevArticles => prevArticles.filter(article => article.article_id !== article_id));
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch(err => {
        console.log(err);
        setMessage(err.message);
        setSpinnerOn(false);
      })
  }


  return (
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <PrivateRoute>
              <ArticleForm 
                postArticle={postArticle} 
                updateArticle={updateArticle} 
                setCurrentArticleId={setCurrentArticleId}
                currentArticle={currentArticle}
                />
              <Articles 
                articles={articles} 
                getArticles={getArticles}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticleId={currentArticleId}
                />
            </PrivateRoute>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
