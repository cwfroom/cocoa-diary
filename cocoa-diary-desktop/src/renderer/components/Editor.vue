<template>
    <div id="right-column">
        <date-selector></date-selector>
        <control-panel></control-panel>
    </div>
</template>

<script>
import ControlPanel from '@/components/EditorComponents/ControlPanel'
import DateSelector  from '@/components/EditorComponents/DateSelector'

export default {
    name:'editor',
    components: {
        DateSelector,
        ControlPanel
    }
}
</script>

<style>

</style>
