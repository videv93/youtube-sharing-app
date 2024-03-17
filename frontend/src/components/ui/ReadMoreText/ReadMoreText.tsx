import { useState } from "react";
import { Button, Collapse, Typography } from "@mui/material";

export function ReadMoreText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.substring(0, 400) + "...";

  return (
    <div>
      <Collapse in={expanded} collapsedSize={96}>
        <Typography>{expanded ? text : preview}</Typography>
      </Collapse>
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Show Less" : "Read More"}
      </Button>
    </div>
  );
}
