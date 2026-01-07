FROM oven/bun:1.3-debian AS build
WORKDIR /app
COPY . .
RUN bun install && \
    bun build

FROM oven/bun:1.3-distroless AS main

EXPOSE 3000

WORKDIR /app
COPY --from=build /app/build ./build

CMD ["bun", "--bun", "run", "./build"]
