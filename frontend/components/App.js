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
   
   // finCurrentArticle should return the article with the id of currentArticleId,
   // if there is no currentArticleId it should return null, if article state is undefined it should return null as well
  const findCurrentArticle = () => {
      if (!currentArticleId || !articles) {
        return null;
      }
      return articles.find(art => art.article_id === currentArticleId);
    }
  const currentArticle = findCurrentArticle();

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  }

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    // let's start: 
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
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth().get(articlesUrl)
      .then(res => {
        console.log(res)
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
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth().post(articlesUrl, article)
      .then(res => {
        console.log(res)
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
    // ✨ implement
    // You got this!
    setSpinnerOn(true);
    axiosWithAuth().put(`${articlesUrl}/${article_id}`, article)
      .then(res => {
        console.log(res)
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
    // ✨ implement
    setSpinnerOn(true);
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        console.log(res)
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
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
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
