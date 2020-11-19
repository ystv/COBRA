import React, { useEffect } from "react";
import { gql, useSubscription } from "@apollo/client";
import { Card, Collapse, Spin, Typography, Statistic } from "antd";
import {
  formatBitPerSec,
  ConvertMinutes,
  tokenRefresh,
} from "../commonFunctions";

const COMMENTS_SUBSCRIPTION = gql`
  subscription {
    streamsChanged {
      rtmp {
        uptime
        server {
          application {
            name
            live {
              stream {
                name
                bw_in
                meta {
                  video {
                    width
                    height
                    frame_rate
                    codec
                  }
                  audio {
                    codec
                    channels
                    sample_rate
                  }
                }
                time
                nclients
              }
            }
          }
        }
      }
    }
  }
`;

function Stats() {
  const ServerStatus = useSubscription(COMMENTS_SUBSCRIPTION);

  useEffect(tokenRefresh, []);

  function LatestComment() {
    return (
      <>
        {ServerStatus.loading || ServerStatus.error !== undefined ? (
          <Spin />
        ) : (
          ServerStatus.data.streamsChanged.rtmp.server.application.map(
            (e: any) => {
              let res = <></>;
              try {
                res = e.live.stream.map((stream: any) => (
                  <Card className="Stream-Card">
                    <small>{`${stream.meta.video.width}x${stream.meta.video.height} ${stream.meta.video.frame_rate}p`}</small>
                    <Typography.Title
                      level={3}
                      copyable={{
                        text: `rtmp://${process.env.REACT_APP_RTMP}/${e.name}/${stream.name}`,
                      }}
                    >
                      {stream.name}
                    </Typography.Title>
                    <Statistic
                      title="Time"
                      value={ConvertMinutes(stream.time)}
                    />
                    <Statistic
                      title="Connected Devices"
                      value={stream.nclients}
                    />
                    <Statistic
                      title="Bitrate In"
                      value={formatBitPerSec(stream.bw_in)}
                    />
                    <br />
                    <Collapse>
                      <Collapse.Panel key="1" header="Stats">
                        {JSON.stringify(stream)}
                      </Collapse.Panel>
                    </Collapse>
                  </Card>
                ));
              } catch {}
              return (
                <div className="Stream-Application">
                  <Typography.Title level={3}>{e.name}</Typography.Title>
                  <div className="Stream-Cards">{res}</div>
                  <br />
                </div>
              );
            }
          )
        )}
      </>
    );
  }

  return (
    <div className="App">
      <div className="App-Content">
        <Typography.Title level={2}>Stats</Typography.Title>
        {LatestComment()}
      </div>
    </div>
  );
}

export default Stats;
