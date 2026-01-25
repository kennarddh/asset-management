FROM dxflrs/garage:v2.2.0 AS garage-source

FROM alpine:latest

RUN apk add --no-cache jq curl

COPY --from=garage-source /garage /usr/local/bin/garage

RUN chmod +x /usr/local/bin/garage