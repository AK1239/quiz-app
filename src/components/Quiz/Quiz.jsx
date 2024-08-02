import React, { useRef, useState, useEffect } from "react";
import "./Quiz.css";

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const Quiz = () => {
  const [action, setAction] = useState("Home");
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

  const circularProgressRef = useRef(null);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (result) {
      animateProgress();
    }
  }, [result]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://opentdb.com/api.php?amount=5&category=18&difficulty=medium&type=multiple");
      const data = await response.json();
      const formattedQuestions = data.results.map((q) => {
        const options = [...q.incorrect_answers, q.correct_answer];
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        const correctAnswerIndex = options.indexOf(q.correct_answer) + 1;
        return {
          question: decodeHtml(q.question),
          option1: decodeHtml(options[0]),
          option2: decodeHtml(options[1]),
          option3: decodeHtml(options[2]),
          option4: decodeHtml(options[3]),
          ans: correctAnswerIndex,
        };
      });
      setQuestions(formattedQuestions);
      setQuestion(formattedQuestions[0]);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const animateProgress = () => {
    let startValue = -1;
    const endValue = (score / questions.length) * 100;
    const speed = 20;

    const progressInterval = setInterval(() => {
      startValue++;
      setProgressValue(startValue);

      // Update the circular progress background
      if (circularProgressRef.current) {
        circularProgressRef.current.style.background = `conic-gradient(#c40094 ${startValue * 3.6}deg, black 0deg)`;
      }

      if (startValue >= endValue) {
        clearInterval(progressInterval);
      }
    }, speed);
  };
  const checkAns = (e, ans) => {
    if (lock === false) {
      if (question.ans === ans) {
        e.target.classList.add("correct");
        setLock(true);
        setScore((prev) => prev + 1);
      } else {
        e.target.classList.add("wrong");
        setLock(true);
        option_array[question.ans - 1].current.classList.add("correct");
      }
    }
  };

  const next = () => {
    if (lock === true) {
      if (index === questions.length - 1) {
        setResult(true);
        return;
      }
      setIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        setQuestion(questions[newIndex]);
        return newIndex;
      });
      setLock(false);
      option_array.forEach((option) => {
        if (option.current) {
          option.current.classList.remove("correct", "wrong");
        }
      });
    }
  };

  const startQuiz = () => {
    setIndex(0);
    setScore(0);
    setLock(false);
    setResult(false);
    setProgressValue(0);
    setAction("Quiz");
    fetchQuestions();
  };

  const reset = () => {
    setIndex(0);
    setScore(0);
    setLock(false);
    setResult(false);
    setProgressValue(0);
    fetchQuestions();
  };

  if (loading && action === "Quiz") {
    return <p className="loading">Loading questions...</p>;
  }

  return (
    <div className="container">
      {action === "Home" ? (
        <div className="home-page">
          <h1 className="home-heading">Hello there 👋</h1>
          <p>Welcome to this quiz app where you can test your IT knowledge with various questions and master your IT skills.</p>
          <h3>Instructions:</h3>
          <p>
            1.When you click an option, you wont be able to change it. <span>Choose carefully!</span>
          </p>
          <p>2.If your answer is correct, the box will change to green, else it will change to red.</p>
          <p>3.You can see the score at the end of the game, and you can restart to start over with new questions!</p>
          <button
            onClick={() => {
              startQuiz();
            }}
          >
            Start
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-header">
            <h1>Quiz App</h1>
            {result ? <></> : <h1>Score: {score}/5</h1>}
          </div>
          <hr />
          {result ? (
            <>
              <div className="result-box">
                <h2>Quiz Result!</h2>
                <div className="percentage-container">
                  <div className="circular-progress" ref={circularProgressRef}>
                    <div className="progress-value">{progressValue}%</div>
                  </div>
                  <span className="score-text">
                    You scored {score} out of {questions.length}
                  </span>
                </div>
                <div className="buttons">
                  <button className="tryAgain-btn" onClick={reset}>
                    Try Again
                  </button>
                  <button className="goHome-btn" onClick={() => setAction("Home")}>
                    Go to Home
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>
                {index + 1}. {question.question}
              </h2>
              <ul>
                <li ref={Option1} onClick={(e) => checkAns(e, 1)}>
                  {question.option1}
                </li>
                <li ref={Option2} onClick={(e) => checkAns(e, 2)}>
                  {question.option2}
                </li>
                <li ref={Option3} onClick={(e) => checkAns(e, 3)}>
                  {question.option3}
                </li>
                <li ref={Option4} onClick={(e) => checkAns(e, 4)}>
                  {question.option4}
                </li>
              </ul>
              <div className="quiz-footer">
                <p>
                  {index + 1} of {questions.length} questions
                </p>
                <button onClick={next}>Next</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
