// import '@testing-library/jest-dom';
import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from "react";
import About from "../Components/About";

describe("About", () => {
    //test case 1
    it("should render the About component", () => {
        render(<About />);
        const aboutElement = screen.getByRole('heading', { level: 1 })//here will check the h1 tag if it's there the test is pass , if not will fail 
        expect(aboutElement).toBeInTheDocument();
    });


    // test 2
    it("should have the text about", () => {
        render(<About />);
        const text = screen.queryAllByText(/about/i);//i for text about not consider the case which capitaal or small
        expect(text).toBeInTheDocument();

    });

    it("should have an image",()=>{
        render(<About/>);
        const image=screen.getAllByAltText('devimage')
        expect(image).toHaveClass('userImgae');// chechk if this class name is presant in css 
    });







});

