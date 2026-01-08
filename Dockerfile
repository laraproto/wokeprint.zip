FROM oven/bun:1.3-debian AS build
WORKDIR /app
COPY . .
RUN bun install && \
    bun run build

FROM oven/bun:1.3-debian AS main

EXPOSE 3000

WORKDIR /app
COPY --from=build /app .

RUN bun i

RUN apt-get update && apt-get install -y python3-pip

RUN pip install --break-system-packages octodns octodns_cloudflare

CMD ["bun", "--bun", "run", "./build"]
