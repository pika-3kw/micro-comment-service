const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let comments = [];
// [{
//   _id:"tttt"
//   postId: "xxxx",
//   comments: [
//     {
//       _id: "zzzz",
//       content: "comment content",
//     },
//   ],
// }]

app.get(/^\/$/, (req, res) => {
  res.send("Comment Service");
});

app.get("/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;

  let commentsByPostId = comments.find((comment) => comment.postId === postId);

  let postComments = [];

  if (commentsByPostId) {
    postComments = commentsByPostId.comments;
  }

  res.json({ comments: postComments });
});

app.post("/posts/:postId/comments", async (req, res) => {
  const _id = randomBytes(4).toString("hex");
  const { content } = req.body;
  const { postId } = req.params;

  const comment = {
    _id,
    content,
    status: "pending",
    postId,
  };

  let commentsByPostId = comments.find((comment) => comment.postId === postId);

  if (commentsByPostId) {
    commentsByPostId.comments.push(comment);
  }

  if (!commentsByPostId) {
    commentsByPostId = {
      _id: randomBytes(4).toString("hex"),
      postId,
      comments: [comment],
    };

    comments.push(commentsByPostId);
  }

  await axios.post("http://localhost:4000/events", {
    type: "CommentCreated",
    data: { ...comment },
  });

  res.json(comment);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, _id, status } = data;

    let postIdx = comments.findIndex((comment) => comment.postId === postId);

    if (postIdx >= 0) {
      let commentIdx = comments[postIdx].comments.findIndex(
        (comment) => comment._id === _id
      );
      if (commentIdx >= 0) {
        comments[postIdx].comments[commentIdx].status = status;

        const _comment = comments[postIdx].comments[commentIdx];

        await axios.post("http://localhost:4000/events", {
          type: "CommentUpdated",
          data: {
            ..._comment,
          },
        });
      }
    }
  }

  res.json({});
});

app.listen(4002, () => {
  console.log("Comment Service running at 4002");
});
