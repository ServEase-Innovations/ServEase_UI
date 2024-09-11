import * as React from "react";
import "./Search_form.css";
import Form from "react-bootstrap/Form";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Button from "react-bootstrap/Button";
import { useForm } from "react-hook-form";
import Dialog from "@mui/material/Dialog";

function valuetext(value: Number) {
  return `${value}°C`;
}

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}
export const Search_form = (props: SimpleDialogProps) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (d: any) => alert(JSON.stringify(d));

  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} className="dialog-class">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="all">
            <div className="flex-container1">
              <div className="item-viewer">
                <div className="checkbox-style">
                  <Form.Check
                    {...register("Men Selected")}
                    id="custom-switch"
                    label="Men"
                  />
                </div>

                <div className="checkbox-style">
                  <Button variant="dark" className="icon-div">
                    <img src="man-user-circle-icon.png"></img>
                  </Button>
                </div>
                <div className="checkbox-style">
                  <Box sx={{ width: 300 }}>
                    <Slider
                      defaultValue={20}
                      {...register("Selected Men Age:")}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={18}
                      max={60}
                    />
                  </Box>
                </div>
              </div>
            </div>
            <div className="flex-container1">
            <div className="item-viewer">
            <div className="checkbox-style">
                <Form.Check
                  {...register("Women Selected")}
                  id="custom-switch"
                  label="Women"
                />
              </div>
              <div className="checkbox-style">
                <Button variant="dark" className="icon-div">
                  <img src="woman-user-color-icon.png"></img>
                </Button>
              </div>

              <div className="checkbox-style">
               <Box sx={{ width: 300 }}>
                  <Slider
                    defaultValue={20}
                    {...register("Selected Men Age:")}
                    getAriaValueText={valuetext}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={18}
                    max={60}
                  />
                </Box>
              </div>
            </div>
            </div>
            <div className="flex-container1">
            <div className="item-viewer">
            <div className="checkbox-style">
                <Form.Check
                  {...register("checkbox")}
                  id="custom-switch"
                  label="Day"
                />
              </div>
              <div className="checkbox-style">
                <Button variant="dark" className="icon-div">
                  <img src="day.png"></img>
                </Button>
              </div>
              <div className="checkbox-style">
                <Box sx={{ width: 300 }}>
                  <Slider
                    defaultValue={6}
                    color="secondary"
                    {...register("Morning Timing")}
                    getAriaValueText={valuetext}
                    aria-label="Time Between"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={6}
                    max={12}
                  />
                </Box>
              </div>
            </div>
            </div>
            <div className="flex-container1">
            <div className="item-viewer">
            <div className="checkbox-style">
                <Form.Check
                  {...register("checkbox")}
                  id="custom-switch"
                  label="Night"
                />
              </div>

              <div className="checkbox-style">
                <Button variant="dark" className="icon-div">
                  <img src="night.png"></img>
                </Button>
              </div>
              <div className="checkbox-style">
                <Box sx={{ width: 300 }}>
                  <Slider
                    defaultValue={4}
                    color="secondary"
                    {...register("Night Timing")}
                    getAriaValueText={valuetext}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={4}
                    max={10}
                  />
                </Box>
              </div>
            </div>
            </div>
            <div className="footer">
              <div className="Sbtn1">
                <Button type="submit" id="button1" variant="outline-dark">
                  Submit
                </Button>
              </div>
              <div className="Sbtn2 ">
                <Button type="reset" id="button2" variant="outline-dark">
                  {" "}
                  Reset{" "}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default Search_form;
