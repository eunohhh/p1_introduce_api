/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

admin.initializeApp(); // 어드민 초기화. 클라우드 함수, 호스팅만 사용할 경우 따로 설정파일을 넘겨주지 않아도 됨
const app = express(); 
const memberApp = express.Router();

const db = admin.firestore();
const memberCollection = "members";

// 해당 부분에 멤버 CRUD 라우트 설정
// 새로운 멤버 추가
memberApp.post("/members", async (req, res) => {
    try {
        const member = {
            name: req.body.name,
            mbti: req.body.mbti,
            number: req.body.number,
            introduce: req.body.introduce,
            blog: req.body.blog,
        };
        const memberDoc = await db.collection(memberCollection).add(member);
        res.status(200).send(`새로운 멤버 추가 ID: ${memberDoc.id}`);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

  // 기존 멤버 수정
memberApp.patch("/members/:membername", async (req, res) => {
    try {
        const updatedMemberDoc = await db
            .collection(memberCollection)
            .doc(req.params.membername)
            .update(req.body);
        res.status(204).send(`${updatedMemberDoc} 멤버 수정 완료`);
    } catch (error) {
        res.status(400).send(`멤버를 수정하는 도중 오류가 발생했습니다`);
    }
});

  // ID로 멤버 불러오기
memberApp.get("/members/:membername", async (req, res) => {
    try {
        const memberDoc = await db
            .collection(memberCollection)
            .doc(req.params.membername)
            .get();

        res.status(200).send({ id: memberDoc.id, ...memberDoc.data() });
    } catch (error) {
        res.status(400).send("멤버를 불러오는데 실패하였습니다");
    }
});

  // 아이디로 기존 멤버 삭제
memberApp.delete("/members/:membername", async (req, res) => {
    try {
        const deleteMemberDoc = await db
            .collection(memberCollection)
            .doc(req.params.membername)
            .delete();

        res.status(204).send(`정상적으로 삭제 ID: ${deleteMemberDoc.id}`);
    } catch (error) {
        res.status(400).send("멤버를 삭제하는데 실패하였습니다");
    }
});

  // 등록된 멤버 모두 조회
memberApp.get("/members", async (req, res) => {
    try {
        const memberDocs = await db.collection(memberCollection).get();
        const members = memberDocs.docs.map((memberDoc) => ({
            id: memberDoc.id,
            ...memberDoc.data(),
        }));
        res.status(200).send(members);
    } catch (error) {
        res.status(400).send("전체 멤버를 불러오는데 실패하였습니다");
    }
});

app.use(express.json()); // body-parser 설정
app.use("/api", memberApp); 

exports.memberAPI = functions.region("asia-northeast3").https.onRequest(app);
