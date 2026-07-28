#!bin bash\
curl -X POST http://localhost:53525/ \
  -H "Content-Type: application/json" \
  -d '{
    "roomName":"CONSULTÓRIO ONDONTOLÓGICO 04",
    "currentPerson":"JOSE MENDEZ",
    "currentDoctor":"YOSAFAT"
  }'