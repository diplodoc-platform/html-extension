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

<h2>Table example</h2>
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

## Long text example

::: html
    <a href="#bottom">to bottom</a>
    <h2 id="top">Top</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque lobortis fermentum placerat. Quisque pretium sagittis laoreet. Curabitur eu sagittis tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec laoreet eu enim nec pretium. Phasellus diam odio, porttitor sed pellentesque et, iaculis a nibh. Morbi sit amet ipsum in purus sagittis egestas. Quisque ut varius odio, id varius enim. Vestibulum venenatis turpis et ipsum gravida, vel consectetur nisi lobortis. Fusce turpis orci, facilisis condimentum lectus lobortis, aliquet imperdiet tortor. In placerat, eros id viverra efficitur, lectus justo auctor mauris, at vehicula massa diam ac ipsum. In eu tristique nisl. Duis aliquam maximus consectetur. Sed semper hendrerit lectus interdum iaculis.</p>
    <p>Nulla facilisi. Vivamus rutrum vel sem et fringilla. Aliquam erat volutpat. Etiam vel placerat mauris, ac aliquam eros. Nunc accumsan elit ut dolor venenatis, porta laoreet metus euismod. Morbi rutrum dignissim neque ac aliquet. Nam facilisis ac massa non egestas. Pellentesque eu consectetur tellus. Maecenas scelerisque cursus lectus non tempor. Etiam non scelerisque quam. Cras a odio sodales, iaculis magna a, bibendum ex. In et arcu auctor urna placerat interdum ut vel ipsum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque sit amet mi lorem. Suspendisse potenti.</p>
    <a href="https://yandex.com">target parent: Yandex site</a>
    <p>Phasellus vitae posuere erat. Sed blandit nunc eget sapien ultrices fermentum. Aenean vestibulum facilisis elit sed aliquet. Phasellus posuere et leo id commodo. Praesent tincidunt egestas est a fermentum. Quisque maximus eros dolor, at condimentum eros faucibus in. In commodo augue id purus semper, non semper orci interdum. Phasellus luctus augue id ornare bibendum. Praesent dignissim nisi nec nisi imperdiet, vel pretium dui vestibulum. In condimentum magna odio, ac suscipit lectus accumsan non.</p>
    <p>Donec imperdiet tortor vitae ipsum gravida euismod. Donec lobortis orci erat, rutrum consequat orci aliquet non. Curabitur non dui eget orci maximus dapibus id vitae orci. Praesent sed venenatis ipsum. Suspendisse bibendum tincidunt arcu, id tempor felis consectetur non. Sed sit amet purus ultrices, tristique enim eu, efficitur mauris. Curabitur sed efficitur ligula, et varius lectus. Morbi libero purus, eleifend in vehicula eu, sagittis eu lacus. Nulla nisi ligula, mollis eu neque ornare, scelerisque rutrum enim. Duis ut volutpat neque. Vivamus gravida, felis a laoreet auctor, leo lacus mattis lacus, non auctor elit tellus ut odio. Phasellus facilisis efficitur dolor, ut fermentum mi mattis in. Suspendisse potenti. Donec tincidunt nunc eu lacus ultricies, a imperdiet est congue. Maecenas non metus non purus lobortis dignissim. Nulla libero dolor, mattis sit amet massa sed, porttitor fringilla tellus.</p>
    <a target="_blank" href="https://yandex.com">target blank: Yandex site</a>
    <p>Donec imperdiet tortor vitae ipsum gravida euismod. Donec lobortis orci erat, rutrum consequat orci aliquet non. Curabitur non dui eget orci maximus dapibus id vitae orci. Praesent sed venenatis ipsum. Suspendisse bibendum tincidunt arcu, id tempor felis consectetur non. Sed sit amet purus ultrices, tristique enim eu, efficitur mauris. Curabitur sed efficitur ligula, et varius lectus. Morbi libero purus, eleifend in vehicula eu, sagittis eu lacus. Nulla nisi ligula, mollis eu neque ornare, scelerisque rutrum enim. Duis ut volutpat neque. Vivamus gravida, felis a laoreet auctor, leo lacus mattis lacus, non auctor elit tellus ut odio. Phasellus facilisis efficitur dolor, ut fermentum mi mattis in. Suspendisse potenti. Donec tincidunt nunc eu lacus ultricies, a imperdiet est congue. Maecenas non metus non purus lobortis dignissim. Nulla libero dolor, mattis sit amet massa sed, porttitor fringilla tellus.</p>
    <h2 id="bottom">Bottom</h2>
    <p>Donec imperdiet tortor vitae ipsum gravida euismod. Donec lobortis orci erat, rutrum consequat orci aliquet non. Curabitur non dui eget orci maximus dapibus id vitae orci. Praesent sed venenatis ipsum. Suspendisse bibendum tincidunt arcu, id tempor felis consectetur non. Sed sit amet purus ultrices, tristique enim eu, efficitur mauris. Curabitur sed efficitur ligula, et varius lectus. Morbi libero purus, eleifend in vehicula eu, sagittis eu lacus. Nulla nisi ligula, mollis eu neque ornare, scelerisque rutrum enim. Duis ut volutpat neque. Vivamus gravida, felis a laoreet auctor, leo lacus mattis lacus, non auctor elit tellus ut odio. Phasellus facilisis efficitur dolor, ut fermentum mi mattis in. Suspendisse potenti. Donec tincidunt nunc eu lacus ultricies, a imperdiet est congue. Maecenas non metus non purus lobortis dignissim. Nulla libero dolor, mattis sit amet massa sed, porttitor fringilla tellus.</p>
    <p>Donec imperdiet tortor vitae ipsum gravida euismod. Donec lobortis orci erat, rutrum consequat orci aliquet non. Curabitur non dui eget orci maximus dapibus id vitae orci. Praesent sed venenatis ipsum. Suspendisse bibendum tincidunt arcu, id tempor felis consectetur non. Sed sit amet purus ultrices, tristique enim eu, efficitur mauris. Curabitur sed efficitur ligula, et varius lectus. Morbi libero purus, eleifend in vehicula eu, sagittis eu lacus. Nulla nisi ligula, mollis eu neque ornare, scelerisque rutrum enim. Duis ut volutpat neque. Vivamus gravida, felis a laoreet auctor, leo lacus mattis lacus, non auctor elit tellus ut odio. Phasellus facilisis efficitur dolor, ut fermentum mi mattis in. Suspendisse potenti. Donec tincidunt nunc eu lacus ultricies, a imperdiet est congue. Maecenas non metus non purus lobortis dignissim. Nulla libero dolor, mattis sit amet massa sed, porttitor fringilla tellus.</p>
    <a href="#top">to top</a>
:::

## Isolated IFrame (with script execution capabilities)

Make sure to set the `embeddingMode` plugin option to `isolated`.

Please note that you also have to provide the `isolatedSandboxHost` plugin option, which should specify a **cross-origin** URL where the `iframe-runtime.html` is hosted.

To test this locally, run the following:

```bash
npx http-server ./iframe -p 5005 -c-1
```

Set the `isolatedSandboxHost` plugin option to `http://localhost:5005/iframe-runtime.html`. You could then run this example as you would normally do (again, make sure to set `embeddingMode` to `isolated`!)

::: html
We're counting. <span id="counter">0</span>

<script>
    const el = document.querySelector('#counter');

    window.setInterval(() => el.textContent = Number(el.textContent) + 1, 1000);
</script>
:::
