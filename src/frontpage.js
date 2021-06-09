import { makeStyles } from "@material-ui/core";

export default function Frontpage() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <></>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
  text: {
    color: "#fff",
  },
}));
