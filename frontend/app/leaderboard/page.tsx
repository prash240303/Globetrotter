"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface userProps {
  userName: string;
  score: number;
}

const generateUserNames = (num: number) => {
  return String.fromCharCode(65 + num);
};

const generateScore = () => {
  return Math.floor(Math.random() * 10);
};

const myPromise = new Promise<userProps[]>((resolve, reject) => {
  setTimeout(() => {
    resolve(generateUserData());
  }, 5000);
});

function generateUserData() {
  let myArr = [];
  //for loop for 26 unique users and update their names and generate score
  for (let i = 0; i < 26; i++) {
    myArr.push({
      userName: generateUserNames(i),
      score: generateScore(),
    });
  }

  function compareScores(a: userProps, b: userProps) {
    return b.score - a.score;
  }

  const data = myArr?.sort(compareScores);
  return data;
}

function Leaderboard() {
  const [users, setUsers] = useState<userProps[]>();
  const [loading, setLoading] = useState<boolean>();
  let currentPage = 0;

  useEffect(() => {
    //make a api call here
    const fetchData = async () => {
      setLoading(true);
      const response = await myPromise;
      console.log("response", response, typeof response);
      if (response) {
        setLoading(false);
        setUsers(response);
      }
    };

    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(fetchData, options);
    
  }, []);

  console.log("here", users);
  console.log("loading", loading);

  if (loading) {
    return (
      <>
        <Loader2 className="animate-spin mx-auto w-full" />
      </>
    );
  }

  return (
    <div className="flex h-screen mx-auto text-center mt-12">
      <div className="max-h-80 scrollArea mx-auto max-w-xl bg-white  overflow-y-scroll">
        {users?.map((user, index) => (
          <div key={index}>
            <div>
              {user.userName} {user.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
