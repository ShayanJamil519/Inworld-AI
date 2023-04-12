import {
  Character,
  CHAT_HISTORY_TYPE,
  HistoryItem,
  HistoryItemActor,
  HistoryItemTriggerEvent,
} from "@inworld/web-sdk";
import { Fade } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { dateWithMilliseconds } from "../helpers/transform";
import { HistoryStyled } from "./Chat.styled";
import { Typing } from "./Typing";
import { useMediaQuery } from "@mui/material";
// import { useMediaQuery } from "@mui/material";
// import type { Theme } from "@mui/material/styles";

interface HistoryProps {
  character: Character;
  history: HistoryItem[];
  playerName: string;
}

type CombinedHistoryActorItem = HistoryItemActor & { groupedText: string };
type CombinedHistoryItem = CombinedHistoryActorItem | HistoryItemTriggerEvent;

export const History = (props: HistoryProps) => {
  const { character, history, playerName } = props;

  const ref = useRef<HTMLDivElement>(null);

  const [combinedChatHistory, setCombinedChatHistory] = useState<
    CombinedHistoryItem[]
  >([]);
  const [isInteractionEnd, setIsInteractionEnd] = useState<boolean>(true);

  useEffect(() => {
    // scroll chat down on history change
    if (ref.current && history) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  useEffect(() => {
    let currentRecord: CombinedHistoryActorItem | undefined;
    const mergedRecords: CombinedHistoryItem[] = [];
    const hasActors = history.find(
      (record: HistoryItem) => record.type === CHAT_HISTORY_TYPE.ACTOR
    );
    const withoutTriggerEvents = history.filter(
      (record: HistoryItem) => record.type !== CHAT_HISTORY_TYPE.TRIGGER_EVENT
    );

    for (let i = 0; i < history.length; i++) {
      let item = history[i];
      switch (item.type) {
        case CHAT_HISTORY_TYPE.ACTOR:
          currentRecord = mergedRecords.find(
            (r) =>
              r.type === CHAT_HISTORY_TYPE.ACTOR &&
              item.type === CHAT_HISTORY_TYPE.ACTOR &&
              r.source.name === item.source.name &&
              r.interactionId === item.interactionId
          ) as CombinedHistoryActorItem;

          if (currentRecord) {
            currentRecord.groupedText! += `${item.text}`;
          } else {
            currentRecord = {
              ...item,
              groupedText: item.text,
            } as CombinedHistoryActorItem;
            mergedRecords.push(currentRecord);
          }
          break;
        case CHAT_HISTORY_TYPE.TRIGGER_EVENT:
          mergedRecords.push(item);
          break;
      }
    }

    // Interaction is considered ended
    // when there is no actor action yet (chat is not started)
    // or last received message is INTERACTION_END.
    const lastInteractionId =
      withoutTriggerEvents[withoutTriggerEvents.length - 1]?.interactionId;

    const interactionEnd = withoutTriggerEvents.find(
      (event) =>
        event.interactionId === lastInteractionId &&
        event.type === CHAT_HISTORY_TYPE.INTERACTION_END
    );

    setIsInteractionEnd(!hasActors || (!!currentRecord && !!interactionEnd));

    setCombinedChatHistory(mergedRecords);
  }, [history]);

  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <HistoryStyled ref={ref}>
      {combinedChatHistory.map((item, index) => {
        let text;
        let author;
        const title =
          item.type === CHAT_HISTORY_TYPE.ACTOR ||
          item.type === CHAT_HISTORY_TYPE.TRIGGER_EVENT
            ? `${dateWithMilliseconds(item.date)} (${item.interactionId})`
            : "";

        switch (item.type) {
          case CHAT_HISTORY_TYPE.ACTOR:
            text = item.groupedText;
            author = item.source.isCharacter
              ? character.getDisplayName()
              : playerName;
            break;
          default:
            break;
        }

        return (
          <Box
            title={title}
            key={index}
            data-id={item.id}
            // height={"500rem"}

            // marginRight={isMobile ? "240px" : "0px"}

            width={isMobile ? "100%" : "100%"}
            sx={{
              ...(author && { textAlign: "left" }),
            }}
          >
            {author ? (
              <>
                <strong>{author}</strong>: {text}
              </>
            ) : (
              text
            )}
          </Box>
        );
      })}
      <Fade in={!isInteractionEnd} timeout={500}>
        <Box margin="0 0 5px">
          <Typing />
        </Box>
      </Fade>
    </HistoryStyled>
  );
};
