# Simple example

```
npm i
npm start
```

Then this documentation will be rendered by [@diplodoc/transform](https://github.com/diplodoc-platform/transform) and opened in your default browser.

# Example

::: html
<div>Simple HTML code</div>
:::

## Markdown header
Markdown text

::: html
<div>HTML code with table</div>
<style>
/*****************/
/***  header   ***/
/*****************/
.header {
    background: #EEE;
    border-radius: 16px;
    font-size: 40px;
    line-height: 40px;
    padding:16px;
    box-sizing: border-box;
    color: #363E45;
    height:335px;
}
.text_header { font-size:16px; line-height:120%; font-weight:500; }

</style>

<!----------------->
<!--   header   --->
<!----------------->
<table width="100%">
    <tr>
        <td width="74%" class="header">
            <div style="width:720px">
                <strong>Header</strong>
                <div class="text_header" style="width:520px">Some text here</div>
            </div>
        </td>
        <td width="1%" style="padding-left:6px"></td>
        <td width="25%" style="min-width:300px"></td>
    </tr>
</table>

:::



After html text
