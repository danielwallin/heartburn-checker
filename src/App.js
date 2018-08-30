import React, { Component } from "react";
import "./App.css";
import json from "./data";

/**
 *
 * Icons
 *
 */

import leftGreen from "./assets/icons/ic-arrow-left-green.svg";
import rightGray from "./assets/icons/ic-arrow-right-gray.svg";
import rightWhite from "./assets/icons/ic-arrow-right-white.svg";
import check from "./assets/icons/ic-checkmark.svg";

const Header = ({ progress, onBackPress, backIsVisible }) => {
  return (
    <header className="p2 relative flex justify-center">
      {backIsVisible && (
        <div
          className="back"
          onClick={() => {
            onBackPress();
          }}
        >
          <img src={leftGreen} />
        </div>
      )}
      <h3>Heartburn Checker</h3>
      <div
        style={{ transform: `translateX(-${100 - progress}%)` }}
        className="absolute progress"
      />
    </header>
  );
};

const Question = ({ question, onClick, selectedBtn }) => {
  const { next, answers, question_text } = question;

  const setData = i => () => {
    let nextQuestion,
      outcome = null;

    if (next[0].hasOwnProperty("outcome")) {
      nextQuestion = false;
      outcome = next;
    } else if (findValueByProperty(next, "answered", i.id)) {
      nextQuestion = findValueByProperty(next, "answered", i.id).next_question;
    } else if (next[0].hasOwnProperty("next_question")) {
      nextQuestion = next[0].next_question;
    } else {
      nextQuestion = null;
    }

    onClick({
      nextQuestion: nextQuestion,
      score: i.score,
      outcome: outcome,
      btnIndex: i.id
    });
  };

  return (
    <div className="flex1 flex justify-center flex-column">
      <h2 className="question">{question_text}</h2>
      <div className="btn-wrapper flex justify-between">
        {answers.map(i => {
          return (
            <button
              key={i.id}
              className={`btn btn-option flex1 ${
                selectedBtn === i.id ? "selected" : ""
              }`}
              onClick={setData(i)}
            >
              <span className="relative flex items-center justify-center">
                <span>{i.label}</span>
                {selectedBtn === i.id && <img className="ml1" src={check} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const initialState = {
  currentQuestion: json.questions[0],
  userScore: 0,
  selectedData: null,
  progress: 0
};

class App extends Component {
  state = initialState;
  storedData = [];

  prev = () => () => {
    if (this.storedData.length >= 1) {
      this.setState(
        {
          ...this.storedData.pop()
        },
        () => {
          if (this.storedData.length == 0) {
            this.setState({
              selectedData: null
            });
          }
        }
      );
    }
  };

  next = selectedData => () => {
    if (this.state.selectedData) {
      this.storedData.push(this.state);

      const progress = findIndexByProperty(
        json.questions,
        "id",
        selectedData.nextQuestion
      );

      const currentQuestion = findValueByProperty(
        json.questions,
        "id",
        selectedData.nextQuestion
      );

      this.setState(
        {
          currentQuestion: currentQuestion,
          progress:
            progress == -1 ? 100 : (progress / json.questions.length) * 100,
          userScore: Number(this.state.userScore) + Number(selectedData.score),
          outcome: this.getOutcome(selectedData.outcome)
        },
        () => {
          this.setState({
            selectedData: null
          });
        }
      );
    }
  };

  reset = () => () => {
    this.storedData = [];
    this.setState({ ...initialState });
  };

  getOutcome(outcome) {
    let outcomeId,
      result = null;

    if (outcome) {
      for (let index = 0; index < outcome.length; index++) {
        const nextQuestion = outcome[index];
        if (
          nextQuestion.hasOwnProperty("max_score") &&
          nextQuestion.max_score >= this.state.userScore
        ) {
          outcomeId = nextQuestion.outcome;
          break;
        } else {
          outcomeId = nextQuestion.outcome;
        }
      }
    }

    if (outcomeId) {
      result = findValueByProperty(json.outcomes, "id", outcomeId);
    }

    return result;
  }

  renderQuestion() {
    return (
      <React.Fragment>
        <Question
          onClick={data => {
            this.setState({
              selectedData: data
            });
          }}
          selectedBtn={
            this.state.selectedData && this.state.selectedData.btnIndex
          }
          question={this.state.currentQuestion}
        />
        <button
          onClick={this.next(this.state.selectedData)}
          disabled={!this.state.selectedData}
          className={`btn w100 flex items-center justify-center relative ${
            this.state.selectedData !== null ? "selected" : ""
          }`}
        >
          <span>Next</span>
          <img
            className="rightIcon ml1 absolute"
            src={this.state.selectedData !== null ? rightWhite : rightGray}
          />
        </button>
      </React.Fragment>
    );
  }

  renderOutcome() {
    return (
      <div className="outcome flex flex-column flex1">
        <div className="flex flex-column flex1 justify-center">
          <h2>Thank you for answering the questions</h2>
          <p>{this.state.outcome.text}</p>
          {this.state.outcome.show_booking_button && (
            <button className="btn selected relative flex items-center justify-center">
              <span>Book a meeting</span>
              <img className="rightIcon ml1 absolute" src={rightWhite} />
            </button>
          )}
        </div>
        <a className="center" onClick={this.reset()}>
          Back to the start screen
        </a>
      </div>
    );
  }

  render() {
    const { currentQuestion } = this.state;

    return (
      <main className="App flex flex-column vh100">
        <Header
          backIsVisible={this.storedData.length >= 1}
          onBackPress={this.prev()}
          progress={this.state.progress}
        />
        <div className="container flex flex1 flex-column items-center justify-center">
          {currentQuestion && this.renderQuestion()}
          {!currentQuestion && this.renderOutcome()}
        </div>
      </main>
    );
  }
}

export default App;

/**
 *
 * Helper functions
 *
 */

function findValueByProperty(arr, key, val) {
  return arr.find(obj => {
    return obj[key] === val;
  });
}

function findIndexByProperty(arr, key, val) {
  return arr.findIndex(obj => {
    return obj[key] === val;
  });
}
