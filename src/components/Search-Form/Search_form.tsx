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
      <Dialog onClose={handleClose} open={open}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="all">
            <div className="flex-container1">
              <div className="gender">
                <div className="men">
                  <Form.Check
                    {...register("Men Selected")}
                    id="custom-switch"
                    label="Men"
                  />
                  <div className="icon-div1">
                    <Button variant="dark">
                      <img src="man-user-circle-icon.png"></img>
                    </Button>
                  </div>
                </div>
                <div className="women">
                  <Form.Check
                    {...register("Women Selected")}
                    id="custom-switch"
                    label="Women"
                  />
                  <div className="icon-div2">
                    <Button variant="dark">
                      <img src="woman-user-color-icon.png"></img>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="sage">
                <div className="slider-1">
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
                <div className="slider-2">
                  <Box sx={{ width: 300 }}>
                    <Slider
                      defaultValue={20}
                      {...register("Selected Women Age:")}
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
            <div className="flex-container2">
              <div className="time">
                <div className="day">
                  <Form.Check
                    {...register("checkbox")}
                    id="custom-switch"
                    label="Day"
                  />
                  <div className="icon-div3">
                    <Button variant="dark">
                      <img src="day.png"></img>
                    </Button>
                  </div>
                </div>
                <div className="night">
                  <Form.Check
                    {...register("checkbox")}
                    id="custom-switch"
                    label="Night"
                  />
                  <div className="icon-div4">
                    <Button variant="dark">
                      <img src="night.png"></img>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="times">
                <div className="time1">
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
                <div className="time1">
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
            <div className="flex-container3">
              <div className="Sbtn1">
                <Button type="submit" id="button1"  variant="outline-dark">
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
