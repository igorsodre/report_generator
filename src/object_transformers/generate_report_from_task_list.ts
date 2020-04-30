'use strict';

import fse from 'fs-extra';
import ExcelJS, { Alignment, Border, Fill, Workbook, Worksheet } from "exceljs";
import { arrayUnique } from "../helpers/Array.helper";

const setDefaultConfigForWorkBookAndGetSheet = (workbook: Workbook): Worksheet => {
    workbook.creator = 'report_generator';
    workbook.lastModifiedBy = 'report_generator';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];
    let sheet = workbook.addWorksheet('Planilha OF/Orcamento ', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });
    const keysToExtract: TWorksheetHeader[] = [
        'index',
        'Tarefa',
        'Disciplina',
        'Atividade',
        'Descricao/Artefato',
        'Plataforma',
        'Complexidade',
        'Componente/Item',
        'Unidade de medida',
        'Descricao da complexidade',
        'Qtd',
        'Nome do Artefato/Objeto',
        'USTIBB',
        'USTIBB Total'];

    sheet.columns = keysToExtract.map(headTitle => {
        return {
            header: headTitle,
            key: headTitle,
            width: 35
        };
    });
    return sheet;
};

const setDefaultStyleForWorkSheet = (sheet: Worksheet): void => {
    const defaultAlignment: Partial<Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const defaultBlueCell: Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '205696' } };
    const columnsWithBlueCells = ['index', 'Tarefa'];
    const defaultBorder: Partial<Border> = { color: { argb: '000000' }, style: 'thin' };

    const maxFontSize = 16
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {

        let maxCellHeight = maxFontSize;
        row.eachCell((cell, colNumber) => {
            if (typeof cell.value === 'string')
                maxCellHeight = Math.max(maxCellHeight, (cell.value.length / (sheet.getColumn(colNumber).width || 35)) * (cell.font?.size || 16));
            if (rowNumber === 1) {
                cell.font = { size: 15, color: { argb: 'FFFFFF' } };
                cell.fill = defaultBlueCell;
            } else if (columnsWithBlueCells.includes(sheet.getColumn(colNumber).key!)) {
                cell.font = { size: 13, color: { argb: 'FFFFFF' } };
                cell.fill = defaultBlueCell;
            }
            cell.border = { bottom: defaultBorder, top: defaultBorder, left: defaultBorder, right: defaultBorder };
            cell.alignment = defaultAlignment;
        });
        row.height = maxCellHeight + 16;
    })
};

const buildExcelReport = (calculatedTaskList: TTaskProperties, sheet: ExcelJS.Worksheet, worksheetAttributes: TWorksheetAttributes): void => {
    let linecounter = 1;
    Object.keys(calculatedTaskList).forEach((k) => {
        const fileList = calculatedTaskList[k];
        const availableCategories = arrayUnique(fileList.map(el => el.category), (str1, str2) => str1 === str2).filter(el => el !== 'OUTRO');
        availableCategories.forEach(category => {
            const availableComplexities = arrayUnique(fileList.filter(file => file.category === category)
                .map(file => file.complexity!), (cmp1, cmp2) => cmp1 === cmp2);
            availableComplexities.forEach(cmp => {
                // Get all files created for this category and for this complexity for this task
                const filesToPutTogether = fileList.filter(file => file.category === category && file.complexity === cmp && file.diffType === 'A');
                if (filesToPutTogether.length) {
                    const fileNames = filesToPutTogether.map(f => f.filePath.replace(f.rootDirectory, ''));
                    sheet.addRow({
                        index: linecounter,
                        Tarefa: '0.0.' + linecounter++,
                        Disciplina: 'IMPLEMENTAÇÃO DE SOFTWARE',
                        Atividade: 'Plataforma Distribuída',
                        "Descricao/Artefato": worksheetAttributes[category]!.A,
                        Plataforma: 'N/A',
                        Complexidade: cmp,
                        "Componente/Item": 'N/A',
                        "Unidade de medida": 'Por Arquivo',
                        "Descricao da complexidade": worksheetAttributes[category]![cmp].description,
                        Qtd: fileNames.length,
                        "Nome do Artefato/Objeto": `task ${k}: ${fileNames.join(', ')}`,
                        USTIBB: worksheetAttributes[category]![cmp].USTBB_A,
                        "USTIBB Total": worksheetAttributes[category]![cmp].USTBB_A * fileNames.length,
                    } as TWorksheetRow);
                }
            });
            availableComplexities.forEach(cmp => {
                // Get all files modified for this category and for this complexity for this task
                const filesToPutTogether = fileList.filter(file => file.category === category && file.complexity === cmp && file.diffType === 'M');
                if (filesToPutTogether.length) {
                    const fileNames = filesToPutTogether.map(f => f.filePath.replace(f.rootDirectory, ''));
                    sheet.addRow({
                        index: linecounter,
                        Tarefa: '0.0.' + linecounter++,
                        Disciplina: 'IMPLEMENTAÇÃO DE SOFTWARE',
                        Atividade: 'Plataforma Distribuída',
                        "Descricao/Artefato": worksheetAttributes[category]!.M,
                        Plataforma: 'N/A',
                        Complexidade: cmp,
                        "Componente/Item": 'N/A',
                        "Unidade de medida": 'Por Arquivo',
                        "Descricao da complexidade": worksheetAttributes[category]![cmp].description,
                        Qtd: fileNames.length,
                        "Nome do Artefato/Objeto": `task ${k}: ${fileNames.join(', ')}`,
                        USTIBB: worksheetAttributes[category]![cmp].USTBB_M,
                        "USTIBB Total": worksheetAttributes[category]![cmp].USTBB_M * fileNames.length,
                    } as TWorksheetRow);
                }
            });
        });
    });
};

const buildTxtReport = (calculatedTaskList: TTaskProperties, worksheetAttributes: TWorksheetAttributes): string => {
    let fileStructure: TTxtStructure = {};
    Object.keys(calculatedTaskList).forEach((k) => {
        const fileList = calculatedTaskList[k];
        const availableCategories = arrayUnique(fileList.map(el => el.category), (str1, str2) => str1 === str2).filter(el => el !== 'OUTRO');
        availableCategories.forEach(category => {
            const availableComplexities = arrayUnique(fileList.filter(file => file.category === category)
                .map(file => file.complexity!), (cmp1, cmp2) => cmp1 === cmp2);
            availableComplexities.forEach(cmp => {

                const filesToPutTogether = fileList
                    .filter(file => file.category === category && file.complexity === cmp && file.diffType === 'A')
                    .map(el => el.filePath.replace(el.rootDirectory, ''));

                if (filesToPutTogether.length) {

                    const fileStructureKey = worksheetAttributes[category]!.TASK_NUMBER_A;
                    const fileCategoryDescription = worksheetAttributes[category]!.A;

                    if (!fileStructure[fileStructureKey]) {
                        fileStructure[fileStructureKey] = {
                            description: `${fileStructureKey} - ${fileCategoryDescription}`,
                            fileList: {}
                        };
                    }

                    if (!fileStructure[fileStructureKey].fileList[cmp])
                        fileStructure[fileStructureKey].fileList[cmp] = [];

                    fileStructure[fileStructureKey].fileList[cmp] = fileStructure[fileStructureKey].fileList[cmp]!.concat(filesToPutTogether);
                }
            });

            availableComplexities.forEach(cmp => {

                const filesToPutTogether = fileList
                    .filter(file => file.category === category && file.complexity === cmp && file.diffType === 'M')
                    .map(el => el.filePath.replace(el.rootDirectory, ''));

                if (filesToPutTogether.length) {

                    const fileStructureKey = worksheetAttributes[category]!.TASK_NUMBER_M;
                    const fileCategoryDescription = worksheetAttributes[category]!.M

                    if (!fileStructure[fileStructureKey]) {
                        fileStructure[fileStructureKey] = {
                            description: `${fileStructureKey} - ${fileCategoryDescription}`,
                            fileList: {}
                        };
                    }
                    if (!fileStructure[fileStructureKey].fileList[cmp])
                        fileStructure[fileStructureKey].fileList[cmp] = [];

                    fileStructure[fileStructureKey].fileList[cmp] = fileStructure[fileStructureKey].fileList[cmp]!.concat(filesToPutTogether);
                }
            });
        })
    });

    let fileOutput = '5.17.6 - Participar em "ritos" de sala ágil\n{task1}\n{task2}\n';
    Object.keys(fileStructure).sort().forEach(structureKey => {
        Object.keys(fileStructure[structureKey].fileList).sort().forEach(cmpKey => {
            const k = cmpKey as TFileComplexity;
            fileOutput += fileStructure[structureKey].description + ' - ' + cmpKey + '\n';
            fileOutput += fileStructure[structureKey].fileList[k]?.join('\n') + '\n';
        });

    });
    return fileOutput;
}


const generateReport = (calculatedTaskList: TTaskProperties, worksheetAttributes: TWorksheetAttributes) => {
    const workbook: Workbook = new ExcelJS.Workbook();
    const sheet = setDefaultConfigForWorkBookAndGetSheet(workbook);

    buildExcelReport(calculatedTaskList, sheet, worksheetAttributes);

    setDefaultStyleForWorkSheet(sheet);
    workbook.xlsx.writeBuffer().then((buffer) => {
        fse.outputFile('output/OF_MES_NOME_SOBRENOME.xlsx', buffer, err => console.log(err));
    }).then(() => {
        const txtReport = buildTxtReport(calculatedTaskList, worksheetAttributes);
        fse.outputFile('output/OF_MES_NOME_SOBRENOME.txt', txtReport, err => console.log(err));
    });
};

export default generateReport;
