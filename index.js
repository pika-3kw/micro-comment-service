const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");

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

app.get("/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;

  let commentsByPostId = comments.find((comment) => comment.postId === postId);

  let postComments = [];

  if (commentsByPostId) {
    postComments = commentsByPostId.comments;
  }

  res.json({ comments: postComments });
});

app.post("/posts/:postId/comments", (req, res) => {
  const _id = randomBytes(4).toString("hex");
  const { content } = req.body;
  const { postId } = req.params;

  const comment = {
    _id,
    content,
  };

  let commentsByPostId = comments.find((comment) => comment.postId === postId);

  if (commentsByPostId) {
    commentsByPostId.comments.push(comment);
  }

  if (!commentsByPostId) {
    commentsByPostId = {
      _id: randomBytes(4).toString("hex"),
      postId,
      comments: [
        {
          comment,
        },
      ],
    };

    comments.push(commentsByPostId);
  }

  res.json(comment);
});

app.listen(4002, () => {
  console.log("Comment Service running at 4002");
});
