require("jsdom-global")()
import { render } from "@testing-library/react"
import MyApp from "./c"
import { Suite } from "../dist/index"

var c = render(MyApp())


export default new Suite("Test example 1")