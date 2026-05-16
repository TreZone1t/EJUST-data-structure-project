FROM gcc:latest AS builder

WORKDIR /app

COPY . .

RUN g++ core.cpp -o build/simulation.exe -lws2_32 

FROM ubuntu:latest

WORKDIR /app

COPY --from=builder /app/build/simulation.exe .

EXPOSE 8081

CMD ["./simulation.exe"]